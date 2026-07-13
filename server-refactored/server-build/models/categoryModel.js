"use strict";

const { pool } = require("../config/db");

const FIELDS = `id, category_name AS categoryName, slug, description, icon, image,
                display_order AS displayOrder, is_active AS isActive,
                created_at AS createdAt, updated_at AS updatedAt`;

async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${FIELDS} FROM categories ORDER BY display_order ASC, category_name ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM categories WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function insert({ categoryName, slug, description, icon, image, displayOrder, isActive }) {
  const [result] = await pool.query(
    `INSERT INTO categories (category_name, slug, description, icon, image, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      categoryName,
      slug || null,
      description || null,
      icon || null,
      image || null,
      displayOrder || 0,
      isActive === false ? 0 : 1,
    ]
  );
  return result.insertId;
}

module.exports = { findAll, findById, insert };
