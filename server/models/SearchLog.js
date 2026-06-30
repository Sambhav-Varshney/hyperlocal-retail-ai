const { pool } = require("../config/db");

async function getSearchLogs() {
  const [rows] = await pool.query(
    `SELECT id, user_id AS userId, keyword, city, state, latitude, longitude,
            results_found AS resultsFound, created_at AS createdAt, updated_at AS updatedAt
     FROM search_logs ORDER BY created_at DESC`
  );
  return rows;
}

async function createSearchLog({ userId, keyword, city, state, latitude, longitude, resultsFound }) {
  const [result] = await pool.query(
    `INSERT INTO search_logs (user_id, keyword, city, state, latitude, longitude, results_found)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId || null, keyword, city || null, state || null, latitude || null, longitude || null, resultsFound || 0]
  );

  return {
    id: result.insertId,
    userId: userId || null,
    keyword,
    city: city || null,
    state: state || null,
    latitude: latitude || null,
    longitude: longitude || null,
    resultsFound: resultsFound || 0,
  };
}

module.exports = { getSearchLogs, createSearchLog };
