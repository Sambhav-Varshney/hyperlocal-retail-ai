"use strict";

const paymentService = require("../services/paymentService");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/respond");

/**
 * Controller Layer for Payments
 * Translates HTTP payment requests into paymentService business logic calls.
 */

const getConfig = asyncHandler(async (req, res) => {
  const keyId = paymentService.getPublicKeyId();
  ok(res, { keyId, mode: "TEST_SANDBOX" });
});

const createOrder = asyncHandler(async (req, res) => {
  const { items, savings, planType, notes } = req.body;
  const paymentOrder = await paymentService.createPaymentOrder({
    userId: req.user.id,
    items,
    savings,
    planType,
    notes,
  });
  created(res, paymentOrder);
});

const verify = asyncHandler(async (req, res) => {
  const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
  const result = await paymentService.verifyPayment({
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId,
  });
  ok(res, result);
});

const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] || req.headers["x-webhook-signature"];
  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  const result = await paymentService.processWebhook(rawBody, signature);
  ok(res, result);
});

const getPaymentById = asyncHandler(async (req, res) => {
  const record = paymentService.getPaymentById(req.params.paymentId);
  ok(res, { payment: record });
});

module.exports = {
  getConfig,
  createOrder,
  verify,
  webhook,
  getPaymentById,
};
