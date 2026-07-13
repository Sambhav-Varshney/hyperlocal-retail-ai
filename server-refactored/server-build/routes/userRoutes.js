"use strict";

const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const { validateIdParam } = validate;
const { registerSchema, loginSchema } = require("../validators/schemas");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// NOTE: kept public (no requireAuth) to match the original API contract —
// the frontend's DataContext calls GET /users unconditionally on every page
// load (including for anonymous visitors) as part of its initial data fetch.
// The response never includes the password hash (see userModel PUBLIC_FIELDS).
router.get("/", userController.getAllUsers);
router.get("/:id", validateIdParam("id"), userController.getUserById);

// Preserved from the original API for backward compatibility with any existing
// consumers that still call /api/users/register and /api/users/login
// (the refactored frontend now uses /api/auth/register and /api/auth/login instead).
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);

module.exports = router;
