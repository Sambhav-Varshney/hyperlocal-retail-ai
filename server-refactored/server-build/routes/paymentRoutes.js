"use strict";

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/respond");
const paymentService = require("../services/paymentService");

const router = express.Router();

/**
 * GET /api/payments/config — Returns public Razorpay key ID for frontend SDK
 */
router.get(
  "/config",
  asyncHandler(async (req, res) => {
    const keyId = paymentService.getPublicKeyId();
    ok(res, { keyId, mode: "TEST_SANDBOX" });
  })
);

/**
 * POST /api/payments/create-order — Creates server-calculated Razorpay payment order
 */
router.post(
  "/create-order",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { items, savings, planType, notes } = req.body;
    const paymentOrder = await paymentService.createPaymentOrder({
      userId: req.user.id,
      items,
      savings,
      planType,
      notes,
    });
    created(res, paymentOrder);
  })
);

/**
 * POST /api/payments/verify — Performs HMAC SHA256 server signature verification
 */
router.post(
  "/verify",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const result = await paymentService.verifyPayment({
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    });
    ok(res, result);
  })
);

/**
 * POST /api/payments/webhook — Idempotent Razorpay Webhook Callback
 */
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] || req.headers["x-webhook-signature"];
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const result = await paymentService.processWebhook(rawBody, signature);
    ok(res, result);
  })
);

/**
 * GET /api/payments/:paymentId — Fetches payment record by payment ID
 */
router.get(
  "/:paymentId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const record = paymentService.getPaymentById(req.params.paymentId);
    ok(res, { payment: record });
  })
);

module.exports = router;
