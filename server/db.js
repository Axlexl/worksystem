const Database = require("better-sqlite3");
const path     = require("path");
const fs       = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "worksystem_server.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  -- Companies (each registered company is a tenant)
  CREATE TABLE IF NOT EXISTS companies (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    ownerName    TEXT NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    status       TEXT NOT NULL DEFAULT 'active',   -- active | suspended | trial
    plan         TEXT NOT NULL DEFAULT 'free',      -- free | pro | enterprise
    licenseKey   TEXT,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    createdAt    TEXT DEFAULT (datetime('now')),
    updatedAt    TEXT DEFAULT (datetime('now'))
  );

  -- Users (belong to a company)
  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    company_id   TEXT NOT NULL,
    username     TEXT NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    password     TEXT NOT NULL,          -- bcrypt hash
    firstName    TEXT DEFAULT '',
    lastName     TEXT DEFAULT '',
    role         TEXT NOT NULL DEFAULT 'administrator', -- administrator|manager|staff|viewer
    status       TEXT NOT NULL DEFAULT 'active',
    emailVerified INTEGER NOT NULL DEFAULT 0,
    createdAt    TEXT DEFAULT (datetime('now')),
    updatedAt    TEXT DEFAULT (datetime('now')),
    UNIQUE(company_id, username),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  );

  -- Email verification tokens
  CREATE TABLE IF NOT EXISTS email_tokens (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    token      TEXT NOT NULL,
    type       TEXT NOT NULL,  -- 'verify_email' | 'password_reset'
    expiresAt  TEXT NOT NULL,
    usedAt     TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Admin portal users (software owner staff)
  CREATE TABLE IF NOT EXISTS admins (
    id        TEXT PRIMARY KEY,
    username  TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'admin',  -- admin | superadmin
    createdAt TEXT DEFAULT (datetime('now'))
  );

  -- Audit log
  CREATE TABLE IF NOT EXISTS audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id   TEXT,
    actor_type TEXT,   -- 'user' | 'admin'
    action     TEXT NOT NULL,
    target     TEXT,
    details    TEXT,
    ip         TEXT,
    createdAt  TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
