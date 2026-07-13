"use strict";

const userService = require("../services/userService");
const { ok, created } = require("../utils/respond");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body);
  created(res, result);
});

const login = asyncHandler(async (req, res) => {
  const result = await userService.login(req.body);
  ok(res, result);
});

module.exports = { register, login };
