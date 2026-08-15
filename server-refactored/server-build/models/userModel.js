"use strict";

const { pool } = require("../config/db");

const PUBLIC_FIELDS = `id, name, email, role, phone, address, created_at AS createdAt, updated_at AS updatedAt`;

async function findAll() {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY name ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/** Includes the password hash — only for internal auth checks, never sent to the client. */
async function findByEmailWithPassword(email) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
}

async function emailExists(email) {
  const [rows] = await pool.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows.length > 0;
}

async function insert({ name, email, hashedPassword, role, phone, address }) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, role || "customer", phone || null, address || null]
  );
  return result.insertId;
}

module.exports = { findAll, findById, findByEmailWithPassword, emailExists, insert };
