const { pool } = require("../config/db");

async function getStores(search) {
  // Build a SELECT that includes a computed `image` field derived from the product name.
  // This avoids changing the database schema while enabling product images in the UI.
  let query = `SELECT id, store_name AS storeName, owner_name AS ownerName, product_name AS productName,
                      category, price, rating, total_reviews AS totalReviews,
                      shop_number AS shopNumber, street, market_area AS marketArea, city, state,
                      pincode, country, full_address AS fullAddress, latitude, longitude, phone,
                      is_open AS isOpen, created_at AS createdAt, updated_at AS updatedAt,
                      CONCAT('https://source.unsplash.com/900x600/?', REPLACE(product_name, ' ', ',')) AS image
               FROM stores`;
  const params = [];
  if (search) {
    search = search.trim();
    const terms = search.split(/\s+/).filter(Boolean);
    const conditions = terms.map(() => `(
      product_name LIKE ? OR
      store_name LIKE ? OR
      category LIKE ? OR
      full_address LIKE ? OR
      owner_name LIKE ?
    )`);
    query += ` WHERE ${conditions.join(' AND ')}`;
    terms.forEach((term) => {
      const wildcard = `%${term}%`;
      params.push(wildcard, wildcard, wildcard, wildcard, wildcard);
    });
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
