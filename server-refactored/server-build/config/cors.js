"use strict";

/**
 * Build the cors() options from environment variables.
 * CORS_ORIGIN can be a single origin or a comma-separated list.
 */
function corsOptions() {
  const raw = process.env.CORS_ORIGIN || "http://localhost:3000";
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);

  return {
    origin(origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
}

module.exports = corsOptions;
