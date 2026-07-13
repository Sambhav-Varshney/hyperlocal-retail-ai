"use strict";

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hyperlocal_retail",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Verify the database connection on startup.
 * Throws so the server process exits instead of silently failing.
 */
async function testConnection() {
  const conn = await pool.getConnection();
  conn.release();
  console.log(`[DB] Connected to MySQL — database: ${process.env.DB_NAME}`);
}

module.exports = { pool, testConnection };
