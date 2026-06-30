const { pool } = require("../config/db");

async function getCategories() {
  const [rows] = await pool.query(
    `SELECT id, category_name AS categoryName, slug, description, icon, image,
            display_order AS displayOrder, is_active AS isActive,
            created_at AS createdAt, updated_at AS updatedAt
     FROM categories
     ORDER BY display_order ASC, category_name ASC`
  );
  return rows;
}

async function getCategoryById(id) {
  const [rows] = await pool.query(
    `SELECT id, category_name AS categoryName, slug, description, icon, image,
            display_order AS displayOrder, is_active AS isActive,
            created_at AS createdAt, updated_at AS updatedAt
     FROM categories WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createCategory({ categoryName, slug, description, icon, image, displayOrder, isActive }) {
  const [result] = await pool.query(
    `INSERT INTO categories (category_name, slug, description, icon, image, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryName, slug, description, icon, image, displayOrder || 0, isActive === false ? 0 : 1]
  );

  return {
    id: result.insertId,
    categoryName,
    slug,
    description,
    icon,
    image,
    displayOrder: displayOrder || 0,
    isActive: isActive === false ? 0 : 1,
  };
}

module.exports = { getCategories, getCategoryById, createCategory };
