"use strict";

require("dotenv").config();

const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
  } catch (err) {
    console.error("[FATAL] Could not connect to MySQL. Check your .env DB_* values.");
    console.error(err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("[UNHANDLED REJECTION]", err);
    server.close(() => process.exit(1));
  });

  process.on("SIGTERM", () => {
    console.log("[Server] SIGTERM received, shutting down gracefully.");
    server.close(() => process.exit(0));
  });
}

start();
