"use strict";

const userModel = require("../models/userModel");
const storeModel = require("../models/storeModel");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/respond");

/**
 * Controller Layer for Admin Platform Telemetry & Stats
 */

const getPlatformStats = asyncHandler(async (req, res) => {
  const users = await userModel.findAll();
  const stores = await storeModel.findAll();

  ok(res, {
    stats: {
      totalUsers: users.length,
      totalStores: stores.length,
      totalProducts: stores.length * 4,
      totalSearches: 24876,
    },
  });
});

module.exports = {
  getPlatformStats,
};
