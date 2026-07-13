"use strict";

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {*}      data     Payload to serialize
 * @param {number} [status] HTTP status (default 200)
 */
function ok(res, data, status = 200) {
  res.status(status).json(data);
}

/**
 * Send a 201 Created response.
 */
function created(res, data) {
  ok(res, data, 201);
}

/**
 * Send a 204 No Content response (no body).
 */
function noContent(res) {
  res.status(204).end();
}

module.exports = { ok, created, noContent };
