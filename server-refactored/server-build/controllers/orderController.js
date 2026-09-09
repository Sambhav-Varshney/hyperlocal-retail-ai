"use strict";

const orderService = require("../services/orderService");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/respond");

/**
 * Controller Layer for Orders
 * Translates HTTP requests into orderService calls and responds using standard JSON formatters.
 */

const createOrder = asyncHandler(async (req, res) => {
  const newOrder = await orderService.createOrder({
    user: req.user,
    ...req.body,
  });
  created(res, { order: newOrder });
});

const getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getCustomerOrders(req.user);
  ok(res, { orders });
});

const getStoreOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getStoreOrders(req.user, req.query.storeName);
  ok(res, { orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const updatedOrder = await orderService.updateOrderStatus(req.user, req.params.id, req.body.status);
  ok(res, { order: updatedOrder });
});

const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrdersAdmin(req.user);
  ok(res, { orders });
});

module.exports = {
  createOrder,
  getCustomerOrders,
  getStoreOrders,
  updateOrderStatus,
  getAllOrdersAdmin,
};
