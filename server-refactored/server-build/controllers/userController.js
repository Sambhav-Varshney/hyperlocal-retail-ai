"use strict";

const userService = require("../services/userService");
const { ok } = require("../utils/respond");
const asyncHandler = require("../utils/asyncHandler");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  ok(res, users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  ok(res, user);
});

module.exports = { getAllUsers, getUserById };
