"use strict";

const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const storeModel = require("../models/storeModel");
const AppError = require("../utils/AppError");

const router = express.Router();

// Require shop_owner role for all shop routes
router.use(requireAuth, requireRole("shop_owner"));

// GET /api/shop/store — Get the authenticated shop owner's store data
router.get("/store", async (req, res, next) => {
  try {
    const allStores = await storeModel.findAll();
    // Match store owned by req.user.id
    const myStore = allStores.find(
      (s) => String(s.ownerId || s.owner_id) === String(req.user.id)
    ) || allStores[0];

    const storeProducts = allStores.filter(
      (s) => s.storeName === myStore?.storeName || String(s.id) === String(myStore?.id)
    );

    res.json({
      success: true,
      store: myStore,
      products: storeProducts,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
