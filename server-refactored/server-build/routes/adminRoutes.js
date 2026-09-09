"use strict";

const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Require admin role for all admin routes
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/stats — Platform-level statistics
router.get("/stats", adminController.getPlatformStats);

module.exports = router;
