const express = require("express");
const { getStores, createStore } = require("../models/Store");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const stores = await getStores(req.query.search || "");
    res.json(stores);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const store = await createStore(req.body);
    res.status(201).json(store);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
