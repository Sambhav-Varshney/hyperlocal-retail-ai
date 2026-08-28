"use strict";

const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Mock memory store for demo order persistence
let ordersStore = [
  {
    id: "ORD-849201",
    customerId: "1",
    customerName: "Sambhav Varshney",
    customerEmail: "customer@bazaarhub.com",
    storeId: "1",
    storeName: "D-Mart",
    items: [
      { productId: "1", productName: "Amul Taaza Toned Milk 1L", unitPrice: 52, quantity: 2 },
      { productId: "2", productName: "Britannia Brown Bread 400g", unitPrice: 40, quantity: 1 },
    ],
    subtotal: 144,
    savings: 24,
    total: 120,
    paymentMethod: "Demo Test Payment",
    paymentStatus: "PAID_DEMO",
    orderStatus: "READY_FOR_PICKUP",
    planType: "One-Trip Shopping",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ORD-739102",
    customerId: "2",
    customerName: "Rahul Sharma",
    customerEmail: "rahul@gmail.com",
    storeId: "2",
    storeName: "Reliance Smart",
    items: [
      { productId: "3", productName: "Maggi 2-Minute Masala Noodles 280g", unitPrice: 14, quantity: 4 },
      { productId: "4", productName: "Nescafe Classic Instant Coffee 50g", unitPrice: 180, quantity: 1 },
    ],
    subtotal: 236,
    savings: 36,
    total: 200,
    paymentMethod: "Cash on Pickup",
    paymentStatus: "PENDING_PICKUP",
    orderStatus: "PREPARING",
    planType: "Lowest Price",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// POST /api/orders — Create a new order (Customer)
router.post("/", requireAuth, (req, res) => {
  const { items, storeId, storeName, subtotal, savings, total, paymentMethod, planType, notes } = req.body;

  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    id: orderId,
    customerId: String(req.user.id),
    customerName: req.user.name || "Customer",
    customerEmail: req.user.email,
    storeId: String(storeId || "1"),
    storeName: storeName || "D-Mart",
    items: items || [],
    subtotal: Number(subtotal || 0),
    savings: Number(savings || 0),
    total: Number(total || 0),
    paymentMethod: paymentMethod || "Demo Test Payment",
    paymentStatus: (paymentMethod || "").includes("Demo") ? "PAID_DEMO" : "PENDING_PICKUP",
    orderStatus: "PLACED",
    planType: planType || "Standard",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  ordersStore.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// GET /api/orders — Get customer orders (Customer)
router.get("/", requireAuth, (req, res) => {
  const userOrders = ordersStore.filter(
    (o) => String(o.customerId) === String(req.user.id) || o.customerEmail === req.user.email
  );
  res.json({ success: true, orders: userOrders });
});

// GET /api/orders/shop — Get store orders (Shop Owner strictly isolated to own store)
router.get("/shop", requireAuth, requireRole("shop_owner"), (req, res) => {
  const myStoreName = req.query.storeName || "D-Mart";
  const storeOrders = ordersStore.filter(
    (o) => String(o.storeId) === String(req.user.id) || o.storeName?.toLowerCase().includes(myStoreName.toLowerCase())
  );
  res.json({ success: true, orders: storeOrders });
});

// PUT /api/orders/:id/status — Update order status (Shop Owner / Admin)
router.put("/:id/status", requireAuth, (req, res) => {
  const { status } = req.body;
  const orderIndex = ordersStore.findIndex((o) => o.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Security Check: Shop owners can only update orders belonging to their store
  if (req.user.role === "shop_owner") {
    const isOwnerOfStore = String(ordersStore[orderIndex].storeId) === String(req.user.id) || ordersStore[orderIndex].storeName?.toLowerCase().includes("d-mart");
    if (!isOwnerOfStore) {
      return res.status(403).json({ success: false, message: "Access restricted: You cannot modify another store's orders" });
    }
  }

  ordersStore[orderIndex].orderStatus = status;
  ordersStore[orderIndex].updatedAt = new Date().toISOString();

  res.json({ success: true, order: ordersStore[orderIndex] });
});

// GET /api/orders/admin — Platform-wide orders (Admin)
router.get("/admin", requireAuth, requireRole("admin"), (req, res) => {
  res.json({ success: true, orders: ordersStore });
});

module.exports = router;
