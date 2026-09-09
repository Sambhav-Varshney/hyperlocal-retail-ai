"use strict";

const express = require("express");
const paymentController = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Thin Route Definitions for Payments
 * Connects HTTP endpoints to paymentController methods.
 */

// GET /api/payments/config — Returns public Razorpay key ID for frontend SDK
router.get("/config", paymentController.getConfig);

// POST /api/payments/create-order — Creates server-calculated Razorpay payment order
router.post("/create-order", requireAuth, paymentController.createOrder);

// POST /api/payments/verify — Performs HMAC SHA256 server signature verification
router.post("/verify", requireAuth, paymentController.verify);

// POST /api/payments/webhook — Idempotent Razorpay Webhook Callback
router.post("/webhook", paymentController.webhook);

// GET /api/payments/:paymentId — Fetches payment record by payment ID
router.get("/:paymentId", requireAuth, paymentController.getPaymentById);

module.exports = router;
