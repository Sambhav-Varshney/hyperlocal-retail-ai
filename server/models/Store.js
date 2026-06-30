const { pool } = require("../config/db");

async function getStores(search) {
  let query = `SELECT id, store_name AS storeName, owner_name AS ownerName, product_name AS productName,
                      category, price, rating, total_reviews AS totalReviews,
                      shop_number AS shopNumber, street, market_area AS marketArea, city, state,
                      pincode, country, full_address AS fullAddress, latitude, longitude, phone,
                      is_open AS isOpen, created_at AS createdAt, updated_at AS updatedAt
               FROM stores`;
  const params = [];
  if (search) {
    query += ` WHERE product_name LIKE ? OR store_name LIKE ? OR category LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  query += ` ORDER BY price ASC`;
  const [rows] = await pool.query(query, params);
  return rows;
}

async function createStore(storeData) {
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
      rating || 4.0,
      totalReviews || 0,
      address?.shopNumber || null,
      address?.street || null,
      address?.marketArea || null,
      address?.city || null,
      address?.state || null,
      address?.pincode || null,
      address?.country || "India",
      fullAddress || null,
      latitude,
      longitude,
      phone || null,
      isOpen === false ? 0 : 1,
    ]
  );

  return { id: result.insertId, ...storeData };
}

module.exports = { getStores, createStore };
