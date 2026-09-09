"use strict";

const orderModel = require("../models/orderModel");
const AppError = require("../utils/AppError");

/**
 * Service Layer for Order Management
 * Encapsulates order business logic, role-based authorization, and status state transitions.
 */

async function createOrder({ user, items, storeId, storeName, subtotal, savings, total, paymentMethod, paymentStatus, planType, notes }) {
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const defaultPaymentStatus = (paymentMethod || "").includes("Demo")
    ? "PAID_DEMO"
    : (paymentMethod || "").includes("Razorpay")
    ? "PAID"
    : "PENDING_PICKUP";

  const newOrder = {
    id: orderId,
    customerId: String(user.id),
    customerName: user.name || "Customer",
    customerEmail: user.email,
    storeId: String(storeId || "1"),
    storeName: storeName || "D-Mart",
    items: Array.isArray(items) ? items : [],
    subtotal: Number(subtotal || 0),
    savings: Number(savings || 0),
    total: Number(total || 0),
    paymentMethod: paymentMethod || "Demo Test Payment",
    paymentStatus: paymentStatus || defaultPaymentStatus,
    orderStatus: "PLACED",
    planType: planType || "Standard",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  return orderModel.insert(newOrder);
}

async function getCustomerOrders(user) {
  if (!user) throw new AppError("Authentication required.", 401);
  return orderModel.findByCustomer(user.id, user.email);
}

async function getStoreOrders(user, queryStoreName) {
  if (!user) throw new AppError("Authentication required.", 401);
  return orderModel.findByStore(user.id, queryStoreName);
}

async function updateOrderStatus(user, orderId, newStatus) {
  if (!user) throw new AppError("Authentication required.", 401);

  const existing = await orderModel.findById(orderId);
  if (!existing) {
    throw new AppError("Order not found.", 404);
  }

  // Security Check: Shop owners can only modify orders belonging to their store
  if (user.role === "shop_owner") {
    const isOwnerOfStore = String(existing.storeId) === String(user.id);

    if (!isOwnerOfStore) {
      throw new AppError("Access restricted: You cannot modify another store's orders.", 403);
    }
  }

  const updatedOrder = await orderModel.updateStatus(orderId, newStatus);
  return updatedOrder;
}

async function getAllOrdersAdmin(user) {
  if (!user || user.role !== "admin") {
    throw new AppError("Access restricted: Admin permission required.", 403);
  }
  return orderModel.findAll();
}

module.exports = {
  createOrder,
  getCustomerOrders,
  getStoreOrders,
  updateOrderStatus,
  getAllOrdersAdmin,
};
