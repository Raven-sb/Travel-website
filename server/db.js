import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./security.js";

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const dbPath = process.env.DB_PATH || resolve(rootDir, "data", "vietnam4trip.db");
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    display_name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    code TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    tour_id TEXT NOT NULL,
    tour_title TEXT NOT NULL,
    date TEXT NOT NULL,
    adults INTEGER NOT NULL,
    children INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    promo TEXT NOT NULL DEFAULT '',
    total INTEGER NOT NULL,
    payment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    note TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_country TEXT NOT NULL,
    contact_requests TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

  CREATE TABLE IF NOT EXISTS tour_overrides (
    tour_id TEXT PRIMARY KEY,
    price INTEGER,
    active INTEGER,
    featured INTEGER
  );
`);

export const seededOwner = (() => {
  const count = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
  if (count > 0) return null;
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "vietnam4trip2026";
  const { salt, hash } = hashPassword(password);
  db.prepare(
    "INSERT INTO admins (username, display_name, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(username, "Chủ Vietnam4trip", hash, salt, new Date().toISOString());
  return { username, password, fromEnv: Boolean(process.env.ADMIN_PASSWORD) };
})();

db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());
