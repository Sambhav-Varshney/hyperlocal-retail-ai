const express = require("express");
const { getSearchLogs, createSearchLog } = require("../models/SearchLog");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const logs = await getSearchLogs();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const log = await createSearchLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
