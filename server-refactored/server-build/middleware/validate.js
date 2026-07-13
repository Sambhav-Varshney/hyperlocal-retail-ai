"use strict";

const AppError = require("../utils/AppError");

/**
 * Returns an Express middleware that validates req.body with the given Joi schema.
 * On failure it creates an AppError with status 422 listing every validation problem.
 *
 * @param {import('joi').Schema} schema
 */
function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // collect ALL validation errors, not just the first
      stripUnknown: true,  // drop fields not in the schema (sanitisation)
      convert: true,       // coerce types where possible (string → number, etc.)
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join("; ");
      return next(new AppError(messages, 422));
    }

    // Replace req.body with the sanitised + coerced value
    req.body = value;
    next();
  };
}

/**
 * Ensures req.params[paramName] is a positive integer (guards against
 * SQL injection attempts and bad input reaching the model layer).
 */
function validateIdParam(paramName = "id") {
  return (req, _res, next) => {
    const value = req.params[paramName];
    if (!/^\d+$/.test(String(value))) {
      return next(new AppError(`Invalid ${paramName} parameter — must be a positive integer.`, 400));
    }
    next();
  };
}

module.exports = validate;
module.exports.validateIdParam = validateIdParam;
