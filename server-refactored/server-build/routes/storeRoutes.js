"use strict";

const express = require("express");
const storeController = require("../controllers/storeController");
const validate = require("../middleware/validate");
const { validateIdParam } = validate;
const { createStoreSchema } = require("../validators/schemas");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", storeController.getStores);

// NEW endpoint — the refactored frontend's StoreDetailsPage/ProductDetailsPage
// fetch a single store by id as a fallback when it isn't already in local state.
// This did not exist in the original backend; adding it is additive and does
// not remove or change any existing route.
router.get("/:id", validateIdParam("id"), storeController.getStoreById);

// Creating stores is an admin-only action. The current frontend never calls
// this endpoint, so restricting it does not break existing functionality.
router.post("/", requireAuth, requireRole("admin"), validate(createStoreSchema), storeController.createStore);

module.exports = router;
