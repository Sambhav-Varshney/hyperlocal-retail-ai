"use strict";

/**
 * Wraps an async route handler so that any rejected promise is automatically
 * forwarded to Express's error pipeline via next(err).
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
