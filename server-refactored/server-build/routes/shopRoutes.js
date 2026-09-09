"use strict";

const express = require("express");
const shopController = require("../controllers/shopController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Require shop_owner role for all shop routes
router.use(requireAuth, requireRole("shop_owner"));

// GET /api/shop/store — Get the authenticated shop owner's store data
router.get("/store", shopController.getMyShopData);

module.exports = router;
