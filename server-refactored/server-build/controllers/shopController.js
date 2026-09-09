"use strict";

const storeModel = require("../models/storeModel");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/respond");

/**
 * Controller Layer for Shop Owner Management
 */

const getMyShopData = asyncHandler(async (req, res) => {
  const allStores = await storeModel.findAll();
  const myStore =
    allStores.find((s) => String(s.ownerId || s.owner_id) === String(req.user.id)) || allStores[0];

  const storeProducts = allStores.filter(
    (s) => s.storeName === myStore?.storeName || String(s.id) === String(myStore?.id)
  );

  ok(res, {
    store: myStore,
    products: storeProducts,
  });
});

module.exports = {
  getMyShopData,
};
