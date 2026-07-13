"use strict";

/**
 * Operational (known) HTTP error.
 * Throwing this anywhere in the request lifecycle is caught by
 * the global error handler and turned into the correct status + JSON body.
 */
class AppError extends Error {
  /**
   * @param {string} message  Human-readable message sent to the client
   * @param {number} status   HTTP status code (default 400)
   */
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
    // Capture the real stack so logs are useful
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
