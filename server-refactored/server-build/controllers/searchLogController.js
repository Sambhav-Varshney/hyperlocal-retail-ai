"use strict";

const searchLogService = require("../services/searchLogService");
const { ok, created } = require("../utils/respond");
const asyncHandler = require("../utils/asyncHandler");

const getSearchLogs = asyncHandler(async (req, res) => {
  const logs = await searchLogService.listSearchLogs();
  ok(res, logs);
});

const createSearchLog = asyncHandler(async (req, res) => {
  // If the request is authenticated, trust the token's user id over the body.
  const payload = { ...req.body };
  if (req.user?.id) payload.userId = req.user.id;

  const log = await searchLogService.createSearchLog(payload);
  created(res, log);
});

module.exports = { getSearchLogs, createSearchLog };
