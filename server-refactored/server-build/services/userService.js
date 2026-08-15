"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("Server auth is misconfigured (missing JWT_SECRET).", 500);

  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    address: row.address,
  };
}

async function listUsers() {
  return userModel.findAll();
}

async function getUserById(id) {
  const user = await userModel.findById(id);
  if (!user) throw new AppError("User not found", 404);
  return user;
}

async function register({ name, email, password, phone, address }) {
  const exists = await userModel.emailExists(email);
  if (exists) throw new AppError("An account with that email already exists.", 409);

  // Always force customer role for public registration
  const role = "customer";
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await userModel.insert({ name, email, hashedPassword, role, phone, address });

  const user = { id, name, email, role, phone: phone || null, address: address || null };
  const token = signToken(user);

  return { user, token };
}

async function login({ email, password }) {
  const row = await userModel.findByEmailWithPassword(email);
  if (!row) throw new AppError("Invalid email or password", 401);

  const valid = await bcrypt.compare(password, row.password);
  if (!valid) throw new AppError("Invalid email or password", 401);

  const user = toPublicUser(row);
  const token = signToken(user);

  return { user, token };
}

module.exports = { listUsers, getUserById, register, login };
