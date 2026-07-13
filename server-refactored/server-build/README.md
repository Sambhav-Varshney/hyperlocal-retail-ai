# BazaarHub Server — Refactored

## ⚠️ Verification status (read this first)

This sandbox environment currently has **all outbound network access blocked**
(`registry.npmjs.org`, `pypi.org`, and even `github.com` all return
`403 host_not_allowed` here), so `npm install` could not be executed and the
server could not actually be started in this session, despite following the
instructions to do so.

What **was** verified in this session, with real commands:
- `node --check` on every single `.js` file — all parse with zero syntax errors.
- A scripted static cross-reference of every `require(...)` in the project
  against the actual `module.exports` of its target file — zero mismatches.
- A manual trace of every route's middleware chain against the real
  Express/Joi/jsonwebtoken/bcryptjs/mysql2 APIs.

What was **not** verified because it requires a live install:
- `npm install` actually succeeding (dependency resolution, version conflicts).
- The server actually booting and binding to a port.
- A live MySQL connection succeeding.
- An end-to-end HTTP request/response cycle.

**Please run the following yourself** and treat that as the real
verification — it should work in any environment with normal internet access:

```bash
npm install
npm start
# or, for auto-reload during development:
npm run dev
```

If `npm start` fails for any reason, paste the error back and it can be fixed
immediately — but as of this delivery it has only been statically verified,
not actually booted.

---

## What changed

### Architecture
Reorganized into a standard layered structure:

```
config/       → db.js (MySQL pool), cors.js
models/       → pure SQL query functions (one file per table)
services/     → business logic (hashing, JWT, duplicate checks, 404s)
controllers/  → thin HTTP layer (req/res only, no SQL, no business logic)
routes/       → route → middleware → controller wiring
middleware/   → auth.js, validate.js, errorHandler.js, notFound.js, rateLimiter.js
validators/   → Joi schemas for every POST body
utils/        → AppError, asyncHandler, respond helpers
sql/          → schema.sql (unchanged — DB structure preserved exactly)
```

Previously everything for a resource lived in one `routes/*.js` file with
inline SQL in `models/*.js`. Now each layer has one job, matching the
requested `controllers/services/middleware/routes/models/config/utils/validators` layout.

### Bugs fixed
- **`GET /api/stores/:id` did not exist** — the frontend's store/product detail
  pages need this; it's now added (additive, doesn't change any existing route).
- **No JWT verification middleware existed anywhere** — any endpoint could be
  hit without a token even though the frontend sends one. Added `requireAuth`,
  `optionalAuth`, and `requireRole` in `middleware/auth.js`.
- **No request validation** — `POST` bodies were passed straight to SQL with
  only implicit validation from column constraints. Added Joi schemas for
  every write endpoint.
- **Inconsistent error handling** — routes called `next(err)` but the only
  error handler in `server.js` returned a generic 500 for everything,
  including validation errors and duplicate-email conflicts. Replaced with a
  proper `errorHandler` that maps `AppError` and known MySQL error codes
  (`ER_DUP_ENTRY`, etc.) to correct status codes and messages.
- **`server.js` never checked the DB connection before listening** — it would
  start and accept traffic even if MySQL was unreachable, failing confusingly
  on the first request. Now it calls `testConnection()` first and exits with
  a clear message if the DB is unreachable.
- **No rate limiting** on `/login` or `/register` — added `authLimiter`
  (20 requests / 15 min) plus a general `apiLimiter` for all `/api` routes.
- **No `helmet()`** — added for standard security headers.
- **CORS was wide open** (`cors()` with no options) — now reads
  `CORS_ORIGIN` from `.env` (defaults to `http://localhost:3000`, matching the
  frontend's dev server).

### API compatibility with the refactored frontend
The frontend's `src/services/api.js` calls:

| Frontend call | Backend route | Status |
|---|---|---|
| `GET /categories` | `GET /api/categories` | unchanged |
| `GET /stores?search=` | `GET /api/stores` | unchanged |
| `GET /stores/:id` | `GET /api/stores/:id` | **added** (didn't exist before) |
| `GET /users` | `GET /api/users` | unchanged, kept public — see note below |
| `GET /search-logs` | `GET /api/search-logs` | unchanged |
| `POST /search-logs` | `POST /api/search-logs` | unchanged, now validated |
| `POST /auth/login` | `POST /api/auth/login` | **added** (new route) |
| `POST /auth/register` | `POST /api/auth/register` | **added** (new route) |

The original backend only had `POST /api/users/login` and
`POST /api/users/register`. Those are **kept working** (backward
compatible) and now also available at `/api/auth/login` /
`/api/auth/register` to match the refactored frontend, which was built to
call the `/auth` prefix.

**Note on `GET /api/users`:** this was left public/unauthenticated
intentionally. The frontend calls it unconditionally on every single page
load (including for logged-out visitors) as part of its initial data fetch —
requiring auth here would break the app for anonymous users. It still never
returns password hashes.

**Note on `POST /api/stores` and `POST /api/categories`:** these are now
admin-only (`requireAuth` + `requireRole('admin')`). The current frontend
has no UI that calls these, so this is a safe hardening with no compatibility
impact — the original endpoints existed but were completely unauthenticated.

### Database
`sql/schema.sql` is byte-for-byte the same as the original — no schema
changes. All models use the exact same table/column names and the same
`snake_case → camelCase` SELECT aliasing as the original code.

### Environment variables (`.env`)
Preserved your original `DB_*` values and added:
- `JWT_SECRET` / `JWT_EXPIRES_IN` — **change `JWT_SECRET` before deploying**,
  it's currently a placeholder.
- `CORS_ORIGIN` — comma-separated allowed origins.
- `NODE_ENV` — controls stack traces in error responses.
