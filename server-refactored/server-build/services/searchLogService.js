"use strict";

const searchLogModel = require("../models/searchLogModel");

async function listSearchLogs() {
  return searchLogModel.findAll();
}

async function createSearchLog(data) {
  const id = await searchLogModel.insert(data);
  return {
    id,
    userId: data.userId || null,
    keyword: data.keyword,
    city: data.city || null,
    state: data.state || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    resultsFound: data.resultsFound || 0,
  };
}

module.exports = { listSearchLogs, createSearchLog };
