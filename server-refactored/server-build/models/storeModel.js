"use strict";

const { pool } = require("../config/db");

const FIELDS = `s.id, p.id AS productId, s.store_name AS storeName, s.owner_name AS ownerName,
                p.product_name AS productName, p.brand, c.id AS categoryId, c.slug AS categorySlug,
                c.category_name AS category, p.price, p.quantity, p.image, s.rating,
                s.total_reviews AS totalReviews, s.shop_number AS shopNumber, s.street,
                s.market_area AS marketArea, s.city, s.state, s.pincode, s.country,
                s.full_address AS fullAddress, s.latitude, s.longitude, s.phone,
                s.is_open AS isOpen, s.created_at AS createdAt, s.updated_at AS updatedAt`;

async function findAll(search) {
  let query = `SELECT ${FIELDS} FROM stores s
               INNER JOIN products p ON p.store_id = s.id
               INNER JOIN categories c ON c.id = p.category_id`;
  const params = [];

  if (search && search.trim()) {
    const terms = search.trim().split(/\s+/).filter(Boolean);
    const conditions = terms.map(
      () => `(p.product_name LIKE ? OR p.brand LIKE ? OR s.store_name LIKE ? OR c.category_name LIKE ?
              OR s.full_address LIKE ? OR s.market_area LIKE ? OR s.street LIKE ? OR s.owner_name LIKE ?)`
    );
    query += ` WHERE ${conditions.join(" AND ")}`;
    terms.forEach((term) => {
      const wildcard = `%${term}%`;
      params.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
    });
  }

  query += ` ORDER BY p.price ASC`;
  const [rows] = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${FIELDS} FROM stores s
     INNER JOIN products p ON p.store_id = s.id
     INNER JOIN categories c ON c.id = p.category_id
     WHERE s.id = ? ORDER BY p.price ASC LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function insert(storeData) {
  const {
    storeName,
    ownerName,
    productName,
    category,
    price,
    rating,
    totalReviews,
    address,
    fullAddress,
    latitude,
    longitude,
    phone,
    isOpen,
  } = storeData;

  const [result] = await pool.query(
    `INSERT INTO stores
      (store_name, owner_name, product_name, category, price, rating, total_reviews,
       shop_number, street, market_area, city, state, pincode, country,
       full_address, latitude, longitude, phone, is_open)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      storeName,
      ownerName || null,
      productName,
      category || null,
      price,
      rating ?? 4.0,
      totalReviews || 0,
      address?.shopNumber || null,
      address?.street || null,
      address?.marketArea || null,
      address?.city || null,
      address?.state || null,
      address?.pincode || null,
      address?.country || "India",
      fullAddress || null,
      latitude ?? null,
      longitude ?? null,
      phone || null,
      isOpen === false ? 0 : 1,
    ]
  );

  return result.insertId;
}

module.exports = { findAll, findById, insert };
