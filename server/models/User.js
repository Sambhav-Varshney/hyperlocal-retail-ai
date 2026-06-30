const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getAllUsers() {
  const [rows] = await pool.query(
    `SELECT id, name, email, role, phone, address, created_at AS createdAt, updated_at AS updatedAt FROM users ORDER BY name ASC`
  );
  return rows;
}

async function getUserByEmail(email) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, email, role, phone, address, created_at AS createdAt, updated_at AS updatedAt
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, password, role, phone, address }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, phone, address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, role || "user", phone || null, address || null]
  );

  return { id: result.insertId, name, email, role: role || "user", phone: phone || null, address: address || null };
}

async function loginUser({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
  };
}

module.exports = { getAllUsers, getUserByEmail, getUserById, createUser, loginUser };
