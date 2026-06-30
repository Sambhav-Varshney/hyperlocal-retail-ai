const express = require("express");
const { getAllUsers, getUserById, createUser, loginUser } = require("../models/User");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const auth = await loginUser(req.body);
    if (!auth) return res.status(401).json({ message: "Invalid email or password" });
    res.json(auth);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
