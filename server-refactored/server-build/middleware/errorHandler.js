"use strict";

const AppError = require("../utils/AppError");

/**
 * Translate known MySQL error codes into user-friendly AppErrors.
 */
function normalizeError(err) {
  if (err instanceof AppError) return err;

  if (err.code === "ER_DUP_ENTRY") {
    return new AppError("A record with that value already exists.", 409);
  }
  if (err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_2") {
    return new AppError("Referenced record does not exist.", 400);
  }
  if (err.code === "ER_BAD_FIELD_ERROR" || err.code === "ER_PARSE_ERROR") {
    return new AppError("Invalid request data.", 400);
  }
  if (err.code === "ECONNREFUSED" || err.code === "PROTOCOL_CONNECTION_LOST") {
    return new AppError("Database connection error. Please try again shortly.", 503);
  }
  if (err.name === "SyntaxError" && "body" in err) {
    return new AppError("Malformed JSON in request body.", 400);
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const known = normalizeError(err);
  const status = known ? known.status : 500;
  const message = known ? known.message : "Internal server error";

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);
  } else if (process.env.NODE_ENV !== "production") {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} -> ${message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && status >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
