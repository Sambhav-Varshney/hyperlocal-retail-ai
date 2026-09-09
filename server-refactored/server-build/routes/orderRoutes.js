"use strict";

const express = require("express");
const orderController = require("../controllers/orderController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * Thin Route Definitions for Orders
 * Connects HTTP endpoints to orderController methods with authentication and role middleware.
 */

// POST /api/orders — Create a new order (Customer)
router.post("/", requireAuth, orderController.createOrder);

// GET /api/orders — Get customer orders (Customer)
router.get("/", requireAuth, orderController.getCustomerOrders);

// GET /api/orders/shop — Get store orders (Shop Owner isolated to own store)
router.get("/shop", requireAuth, requireRole("shop_owner"), orderController.getStoreOrders);

// PUT or PATCH /api/orders/:id/status — Update order status (Shop Owner / Admin)
router.put("/:id/status", requireAuth, orderController.updateOrderStatus);
router.patch("/:id/status", requireAuth, orderController.updateOrderStatus);

// GET /api/orders/admin — Platform-wide orders (Admin)
router.get("/admin", requireAuth, requireRole("admin"), orderController.getAllOrdersAdmin);

module.exports = router;
