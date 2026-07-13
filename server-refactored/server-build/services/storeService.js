"use strict";

const storeModel = require("../models/storeModel");
const AppError = require("../utils/AppError");

async function listStores(search) {
  return storeModel.findAll(search);
}

async function getStoreById(id) {
  const store = await storeModel.findById(id);
  if (!store) throw new AppError("Store not found", 404);
  return store;
}

async function createStore(data) {
  const id = await storeModel.insert(data);
  return getStoreById(id);
}

module.exports = { listStores, getStoreById, createStore };
