"use strict";

const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

/**
 * Requires a valid Bearer JWT on the Authorization header.
 * Populates req.user = { id, email, role } on success.
 */
function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Authentication token missing. Include 'Authorization: Bearer <token>'.", 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError("Server auth is misconfigured (missing JWT_SECRET).", 500));
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Session expired. Please login again.", 401));
      }
      return next(new AppError("Invalid authentication token.", 401));
    }

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  });
}

/**
 * Populates req.user if a valid token is present, but does NOT reject the
 * request when the token is missing or invalid. Useful for endpoints that
 * behave differently for logged-in vs anonymous users (e.g. search logs).
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  const secret = process.env.JWT_SECRET;

  if (scheme !== "Bearer" || !token || !secret) {
    return next();
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (!err && decoded) {
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    }
    next();
  });
}

/**
 * Restricts a route to one or more roles. Must run after requireAuth.
 * Usage: router.delete('/:id', requireAuth, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
