"use strict";

const storeService = require("../services/storeService");
const { ok, created } = require("../utils/respond");
const asyncHandler = require("../utils/asyncHandler");

const getStores = asyncHandler(async (req, res) => {
  const stores = await storeService.listStores(req.query.search || "");
  ok(res, stores);
});

const getStoreById = asyncHandler(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id);
  ok(res, store);
});

const createStore = asyncHandler(async (req, res) => {
  const store = await storeService.createStore(req.body);
  created(res, store);
});

module.exports = { getStores, getStoreById, createStore };
