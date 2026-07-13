"use strict";

const express = require("express");
const searchLogController = require("../controllers/searchLogController");
const validate = require("../middleware/validate");
const { createSearchLogSchema } = require("../validators/schemas");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", searchLogController.getSearchLogs);

// Public — both guests and logged-in users trigger searches. When a valid
// token is supplied, optionalAuth attaches req.user so the controller can
// trust the token's user id over whatever the client sent in the body.
router.post("/", optionalAuth, validate(createSearchLogSchema), searchLogController.createSearchLog);

module.exports = router;
