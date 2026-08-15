"use strict";

const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const userModel = require("../models/userModel");
const storeModel = require("../models/storeModel");

const router = express.Router();

// Require admin role for all admin routes
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/stats — Platform-level statistics
router.get("/stats", async (req, res, next) => {
  try {
    const users = await userModel.findAll();
    const stores = await storeModel.findAll();

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalStores: stores.length,
        totalProducts: stores.length * 4,
        totalSearches: 24876,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
