"use strict";

const categoryModel = require("../models/categoryModel");
const AppError = require("../utils/AppError");

async function listCategories() {
  return categoryModel.findAll();
}

async function getCategoryById(id) {
  const category = await categoryModel.findById(id);
  if (!category) throw new AppError("Category not found", 404);
  return category;
}

async function createCategory(data) {
  const id = await categoryModel.insert(data);
  return getCategoryById(id);
}

module.exports = { listCategories, getCategoryById, createCategory };
