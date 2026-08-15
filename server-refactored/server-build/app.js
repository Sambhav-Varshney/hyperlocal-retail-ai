"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const corsOptions = require("./config/cors");
const { apiLimiter } = require("./middleware/rateLimiter");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const storeRoutes = require("./routes/storeRoutes");
const searchLogRoutes = require("./routes/searchLogRoutes");
const userRoutes = require("./routes/userRoutes");
const shopRoutes = require("./routes/shopRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(helmet());
app.use(cors(corsOptions()));
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Hyperlocal Retail AI API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/search-logs", searchLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
