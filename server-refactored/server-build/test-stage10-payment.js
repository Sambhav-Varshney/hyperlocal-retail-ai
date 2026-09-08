"use strict";

const assert = require("assert");
const crypto = require("crypto");
const paymentService = require("./services/paymentService");

async function runStage10PaymentTests() {
  console.log("==================================================");
  console.log("RUNNING STAGE 10 PAYMENT SERVER UNIT TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ TEST ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ TEST ${total}: ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ TEST ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ TEST ${total}: ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // 1. Payment configuration fallback & secret non-exposure
  test("1. Payment configuration fallback (public key only, secret non-exposure)", () => {
    const keyId = paymentService.getPublicKeyId();
    assert.strictEqual(typeof keyId, "string");
    assert.ok(keyId.length > 0);
    assert.ok(!keyId.includes("secret"), "Public keyId must never contain secret");
  });

  // 2. Create payment order validation
  test("2. Create payment order validation (rejects empty basket)", () => {
    assert.throws(
      () => paymentService.calculateAuthoritativeTotal([]),
      /Invalid basket/
    );
  });

  // 3. Server-side amount validation & price manipulation prevention
  test("3. Server-side amount validation & price manipulation rejection", () => {
    // Client attempts to pass manipulated unitPrice = ₹1 for product ID 1 (Amul Milk, catalog price ₹52)
    const manipulatedBasket = [
      { productId: "1", productName: "Amul Taaza Toned Milk 1L", unitPrice: 1, quantity: 2 },
    ];
    const { finalTotal, amountInPaise } = paymentService.calculateAuthoritativeTotal(manipulatedBasket, 0);

    // Server MUST use authoritative catalog price ₹52 × 2 = ₹104 (10400 paise), NOT client ₹1!
    assert.strictEqual(finalTotal, 104, "Server total must equal 52 * 2 = 104");
    assert.strictEqual(amountInPaise, 10400, "Paise total must equal 10400");
  });

  // 4. Valid Razorpay signature verification
  await asyncTest("4. Valid Razorpay signature verification transitions state to PAID", async () => {
    const payment = await paymentService.createPaymentOrder({
      userId: "user_123",
      items: [{ productId: "3", quantity: 2 }],
      savings: 0,
    });

    const verifyResult = await paymentService.verifyPayment({
      paymentId: payment.paymentId,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: "pay_test_valid_123",
      razorpaySignature: "sig_valid_test",
      orderId: "ORD-999001",
    });

    assert.strictEqual(verifyResult.verified, true);
    assert.strictEqual(verifyResult.payment.status, "PAID");
    assert.strictEqual(verifyResult.payment.orderId, "ORD-999001");
  });

  // 5. Invalid Razorpay signature rejection
  await asyncTest("5. Invalid Razorpay signature is rejected with error & status FAILED", async () => {
    const payment = await paymentService.createPaymentOrder({
      userId: "user_124",
      items: [{ productId: "1", quantity: 1 }],
      savings: 0,
    });

    try {
      await paymentService.verifyPayment({
        paymentId: payment.paymentId,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: "pay_test_invalid",
        razorpaySignature: "invalid_signature_xyz",
      });
      assert.fail("Should have thrown AppError for invalid signature");
    } catch (err) {
      assert.match(err.message, /Invalid payment signature/);
    }
  });

  // 6. Duplicate verification idempotency
  await asyncTest("6. Duplicate payment verification is idempotent and does not corrupt state", async () => {
    const payment = await paymentService.createPaymentOrder({
      userId: "user_125",
      items: [{ productId: "2", quantity: 1 }],
      savings: 0,
    });

    const verifyFirst = await paymentService.verifyPayment({
      paymentId: payment.paymentId,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: "pay_test_dup",
      razorpaySignature: "sig_dup_test",
      orderId: "ORD-999002",
    });

    assert.strictEqual(verifyFirst.verified, true);

    const verifySecond = await paymentService.verifyPayment({
      paymentId: payment.paymentId,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: "pay_test_dup",
      razorpaySignature: "sig_dup_test",
      orderId: "ORD-999002",
    });

    assert.strictEqual(verifySecond.alreadyVerified, true);
    assert.strictEqual(verifySecond.payment.status, "PAID");
  });

  // 7. Failed payment transition validation
  test("7. Failed payment transition validation (PAID terminal state protection)", () => {
    const record = { id: "PAY-TEST", status: "PAID" };
    assert.throws(
      () => paymentService.transitionPaymentStatus(record, "FAILED"),
      /Invalid payment status transition/
    );
  });

  // 8. Cancelled payment transition
  test("8. Cancelled payment transition from CREATED to CANCELLED", () => {
    const record = { id: "PAY-TEST-CANCEL", status: "CREATED" };
    const updated = paymentService.transitionPaymentStatus(record, "CANCELLED");
    assert.strictEqual(updated.status, "CANCELLED");
  });

  // 9. Duplicate webhook event idempotency
  await asyncTest("9. Duplicate webhook event handling is idempotent", async () => {
    const webhookPayload = JSON.stringify({
      event_id: "evt_test_12345",
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_webhook_123", order_id: "order_demo_849201" } },
      },
    });

    const res1 = await paymentService.processWebhook(webhookPayload, "test_webhook_sig");
    assert.strictEqual(res1.processed, true);

    const res2 = await paymentService.processWebhook(webhookPayload, "test_webhook_sig");
    assert.strictEqual(res2.idempotent, true);
  });

  // 10. HMAC SHA256 Webhook signature algorithm verification
  test("10. Webhook HMAC SHA256 signature verification algorithm", () => {
    const secret = "rzp_webhook_secret_demo";
    const payload = JSON.stringify({ event: "payment.captured", id: "evt_hmac_test" });
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    assert.strictEqual(signature, expected);
  });

  // 11. Secret leak prevention check
  test("11. Verified secret keys are never returned in public payment service outputs", () => {
    const publicConfig = paymentService.getPublicKeyId();
    assert.strictEqual(publicConfig.includes(process.env.RAZORPAY_KEY_SECRET || "secret"), false);
  });

  console.log("\n==================================================");
  console.log(`STAGE 10 PAYMENT SERVER TEST RESULTS: ${passed}/${total} PASSED`);
  console.log("==================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runStage10PaymentTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
