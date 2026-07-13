"use strict";

const { pool } = require("../config/db");

const FIELDS = `id, user_id AS userId, keyword, city, state, latitude, longitude,
                results_found AS resultsFound, created_at AS createdAt, updated_at AS updatedAt`;

async function findAll() {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM search_logs ORDER BY created_at DESC`);
  return rows;
}

async function insert({ userId, keyword, city, state, latitude, longitude, resultsFound }) {
  const [result] = await pool.query(
    `INSERT INTO search_logs (user_id, keyword, city, state, latitude, longitude, results_found)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId || null, keyword, city || null, state || null, latitude ?? null, longitude ?? null, resultsFound || 0]
  );
  return result.insertId;
}

module.exports = { findAll, insert };
