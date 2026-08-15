"use strict";

const Joi = require("joi");

// ── Auth ──────────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid("customer", "shop_owner", "admin").default("customer"),
  phone: Joi.string().max(30).allow("", null).optional(),
  address: Joi.string().max(500).allow("", null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(1).required(),
});

// ── Stores ────────────────────────────────────────────────────────────────────

const createStoreSchema = Joi.object({
  storeName: Joi.string().trim().min(2).max(255).required(),
  ownerName: Joi.string().trim().max(255).allow("", null).optional(),
  productName: Joi.string().trim().min(1).max(255).required(),
  category: Joi.string().trim().max(255).allow("", null).optional(),
  price: Joi.number().min(0).required(),
  rating: Joi.number().min(0).max(5).default(4.0),
  totalReviews: Joi.number().integer().min(0).default(0),
  address: Joi.object({
    shopNumber: Joi.string().max(100).allow("", null).optional(),
    street: Joi.string().max(255).allow("", null).optional(),
    marketArea: Joi.string().max(255).allow("", null).optional(),
    city: Joi.string().max(255).allow("", null).optional(),
    state: Joi.string().max(255).allow("", null).optional(),
    pincode: Joi.string().max(50).allow("", null).optional(),
    country: Joi.string().max(100).default("India"),
  }).optional(),
  fullAddress: Joi.string().max(1000).allow("", null).optional(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
  phone: Joi.string().max(100).allow("", null).optional(),
  isOpen: Joi.boolean().default(true),
});

// ── Categories ────────────────────────────────────────────────────────────────

const createCategorySchema = Joi.object({
  categoryName: Joi.string().trim().min(1).max(255).required(),
  slug: Joi.string().trim().max(255).allow("", null).optional(),
  description: Joi.string().max(2000).allow("", null).optional(),
  icon: Joi.string().max(255).allow("", null).optional(),
  image: Joi.string().max(255).allow("", null).optional(),
  displayOrder: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

// ── Search Logs ───────────────────────────────────────────────────────────────

const createSearchLogSchema = Joi.object({
  userId: Joi.number().integer().min(1).allow(null).optional(),
  keyword: Joi.string().trim().min(1).max(255).required(),
  city: Joi.string().max(255).allow("", null).optional(),
  state: Joi.string().max(255).allow("", null).optional(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
  resultsFound: Joi.number().integer().min(0).default(0),
});

module.exports = {
  registerSchema,
  loginSchema,
  createStoreSchema,
  createCategorySchema,
  createSearchLogSchema,
};
