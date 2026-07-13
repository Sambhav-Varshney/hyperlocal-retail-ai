"use strict";

const categoryService = require("../services/categoryService");
const { ok, created } = require("../utils/respond");
const asyncHandler = require("../utils/asyncHandler");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories();
  ok(res, categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  ok(res, category);
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  created(res, category);
});

module.exports = { getCategories, getCategoryById, createCategory };
