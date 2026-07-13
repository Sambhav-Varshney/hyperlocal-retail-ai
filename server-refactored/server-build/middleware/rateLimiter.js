"use strict";

const rateLimit = require("express-rate-limit");

/**
 * General API limiter — generous, applied to every /api request.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

/**
 * Strict limiter for auth endpoints (login/register) to slow down brute force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again later." },
});

module.exports = { apiLimiter, authLimiter };
