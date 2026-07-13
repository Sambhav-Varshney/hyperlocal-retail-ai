"use strict";

const express = require("express");
const categoryController = require("../controllers/categoryController");
const validate = require("../middleware/validate");
const { validateIdParam } = validate;
const { createCategorySchema } = require("../validators/schemas");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/:id", validateIdParam("id"), categoryController.getCategoryById);

// Creating categories is an admin-only action. The current frontend never calls
// this endpoint, so restricting it does not break existing functionality.
router.post("/", requireAuth, requireRole("admin"), validate(createCategorySchema), categoryController.createCategory);

module.exports = router;
