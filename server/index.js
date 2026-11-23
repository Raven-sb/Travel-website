import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { db, rootDir, seededOwner } from "./db.js";
import { BASE_TOURS, publicOverridesScript, tourById, toursWithOverrides } from "./catalog.js";
import { checkPassword, hashPassword, newToken, sha256 } from "./security.js";

const PORT = Number(process.env.PORT) || 8088;
const HOST = process.env.HOST || "0.0.0.0";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STATUSES = ["new", "confirmed", "done", "cancelled"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

const BLOCKED_ROOTS = new Set(["server", "data", "node_modules"]);
const BLOCKED_FILES = new Set(["package.json", "package-lock.json", ".git"]);

function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(body);
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function securityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || "";
  raw.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function isSecure(req) {
  return Boolean(req.socket.encrypted) || req.headers["x-forwarded-proto"] === "https";
}

function setSessionCookie(req, res, token) {
  const attrs = ["Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=" + Math.floor(SESSION_TTL_MS / 1000)];
  if (isSecure(req)) attrs.push("Secure");
  res.setHeader("Set-Cookie", "v4t_session=" + token + "; " + attrs.join("; "));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "v4t_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function readBody(req, limit = 65536) {
  return new Promise((resolveBody, rejectBody) => {
    let size = 0;
    let done = false;
    const chunks = [];
    req.on("data", (chunk) => {
      if (done) return;
      size += chunk.length;
      if (size > limit) {
        done = true;
        rejectBody(httpError(413, "Dữ liệu gửi lên quá lớn"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (done) return;
      done = true;
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolveBody({});
      try {
        resolveBody(JSON.parse(raw));
      } catch (e) {
        rejectBody(httpError(400, "Dữ liệu không hợp lệ"));
      }
    });
    req.on("error", () => {
      if (!done) {
        done = true;
        rejectBody(httpError(400, "Không đọc được dữ liệu"));
      }
    });
  });
}

function str(value, max) {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function intInRange(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function localISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localISO(d);
}

function badOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.host;
  } catch (e) {
    return true;
  }
}

/* Sessions ---------------------------------------------------------------- */
function createSession(adminId) {
  const token = newToken();
  const now = new Date();
  db.prepare("INSERT INTO sessions (token_hash, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(sha256(token), adminId, now.toISOString(), new Date(now.getTime() + SESSION_TTL_MS).toISOString());
  return token;
}

function currentAdmin(req) {
  const token = parseCookies(req).v4t_session;
  if (!token) return null;
  const tokenHash = sha256(token);
  const row = db.prepare(
    "SELECT s.expires_at, a.id, a.username, a.display_name FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token_hash = ?"
  ).get(tokenHash);
  if (!row) return null;
  if (row.expires_at < new Date().toISOString()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }
  return { id: row.id, username: row.username, displayName: row.display_name };
}

function requireAdmin(req, res) {
  const admin = currentAdmin(req);
  if (!admin) {
    sendJSON(res, 401, { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
    return null;
  }
  return admin;
}

/* Throttles ------------------------------------------------------------- */
const loginFails = new Map();
const bookingHits = new Map();

function loginBlocked(ip) {
  const entry = loginFails.get(ip);
  if (!entry) return false;
  if (entry.until && entry.until > Date.now()) return true;
  if (entry.until && entry.until <= Date.now()) loginFails.delete(ip);
  return false;
}

function noteLoginFail(ip) {
  const entry = loginFails.get(ip) || { count: 0, until: 0 };
  entry.count += 1;
  if (entry.count >= 8) entry.until = Date.now() + 10 * 60 * 1000;
  loginFails.set(ip, entry);
  if (loginFails.size > 2000) loginFails.clear();
}

function allowBooking(ip) {
  const now = Date.now();
  const list = (bookingHits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (list.length >= 25) {
    bookingHits.set(ip, list);
    return false;
  }
  list.push(now);
  bookingHits.set(ip, list);
  if (bookingHits.size > 5000) bookingHits.clear();
  return true;
}

/* Bookings -------------------------------------------------------------- */
function bookingJSON(row) {
  return {
    code: row.code,
    createdAt: row.created_at,
    tourId: row.tour_id,
    tourTitle: row.tour_title,
    date: row.date,
    adults: row.adults,
    children: row.children,
    subtotal: row.subtotal,
    discount: row.discount,
    promo: row.promo,
    total: row.total,
    payment: row.payment,
    status: row.status,
    note: row.note,
    contact: {
      name: row.contact_name,
      email: row.contact_email,
      phone: row.contact_phone,
      country: row.contact_country,
      requests: row.contact_requests
    }
  };
}

function getBookingRow(code) {
  return db.prepare("SELECT * FROM bookings WHERE code = ?").get(code);
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code = "V4T-" + code;
    if (!getBookingRow(code)) return code;
  }
  throw httpError(500, "Không tạo được mã đơn");
}

async function createBooking(req, res, ip) {
  if (!allowBooking(ip)) throw httpError(429, "Bạn đã gửi quá nhiều đơn. Vui lòng thử lại sau.");
  const body = await readBody(req, 32768);
  const contact = body.contact && typeof body.contact === "object" ? body.contact : {};

  const name = str(contact.name, 120).trim();
  const email = str(contact.email, 160).trim();
  const phone = str(contact.phone, 40).trim();
  const country = str(contact.country, 40).trim() || "vn";
  const requests = str(contact.requests, 1000).trim();

  if (name.length < 2) throw httpError(400, "Vui lòng nhập họ tên");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw httpError(400, "Email không hợp lệ");
  if (!/^\+?\d{8,15}$/.test(phone.replace(/[\s().-]/g, ""))) throw httpError(400, "Số điện thoại không hợp lệ");

  const tour = tourById(str(body.tourId, 80));
  if (!tour || !tour.active) throw httpError(400, "Tour này hiện không mở bán");

  const date = str(body.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date + "T00:00:00").getTime())) {
    throw httpError(400, "Ngày khởi hành không hợp lệ");
  }
  if (date < tomorrowISO()) throw httpError(400, "Ngày khởi hành phải từ ngày mai trở đi");

  const adults = intInRange(body.adults, 1, 20, 2);
  const children = intInRange(body.children, 0, 10, 0);
  const payment = body.payment === "card" ? "card" : "later";
  const promo = str(body.promo, 20).trim().toUpperCase() === "VIETNAM10" ? "VIETNAM10" : "";

  const childPrice = Math.round(tour.price * 0.6);
  const subtotal = adults * tour.price + children * childPrice;
  const discount = promo ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const code = generateCode();
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO bookings (code, created_at, tour_id, tour_title, date, adults, children, subtotal, discount, promo, total, payment, status, note, contact_name, contact_email, contact_phone, contact_country, contact_requests) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', ?, ?, ?, ?, ?)"
  ).run(code, createdAt, tour.id, tour.title.vi, date, adults, children, subtotal, discount, promo, total, payment, name, email, phone, country, requests);

  sendJSON(res, 201, { code, createdAt, total, date, adults, children });
}

/* Admin API ------------------------------------------------------------- */
function adminJSON(row, selfId) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    createdAt: row.created_at,
    isSelf: row.id === selfId
  };
}

async function login(req, res, ip) {
  if (loginBlocked(ip)) throw httpError(429, "Sai quá nhiều lần. Vui lòng thử lại sau 10 phút.");
  const body = await readBody(req, 4096);
  const username = str(body.username, 64).trim();
  const password = str(body.password, 200);
  const row = username
    ? db.prepare("SELECT * FROM admins WHERE username = ?").get(username)
    : undefined;

  if (!row || !checkPassword(password, row.salt, row.password_hash)) {
    noteLoginFail(ip);
    throw httpError(401, "Sai tên đăng nhập hoặc mật khẩu");
  }

  loginFails.delete(ip);
  const token = createSession(row.id);
  setSessionCookie(req, res, token);
  sendJSON(res, 200, { admin: { id: row.id, username: row.username, displayName: row.display_name } });
}

function logout(req, res) {
  const token = parseCookies(req).v4t_session;
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  clearSessionCookie(res);
  sendJSON(res, 200, { ok: true });
}

async function handleApi(req, res, pathname) {
  const method = req.method || "GET";
  const ip = req.socket.remoteAddress || "unknown";

  if (method !== "GET" && pathname.startsWith("/api/") && badOrigin(req)) {
    throw httpError(403, "Yêu cầu không hợp lệ");
  }

  if (pathname === "/api/overrides.js" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-store" });
    res.end(publicOverridesScript());
    return;
  }

  if (pathname === "/api/bookings" && method === "POST") {
    return createBooking(req, res, ip);
  }

  if (pathname === "/api/admin/login" && method === "POST") {
    return login(req, res, ip);
  }

  if (pathname === "/api/admin/logout" && method === "POST") {
    return logout(req, res);
  }

  if (pathname === "/api/admin/me" && method === "GET") {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    return sendJSON(res, 200, { admin });
  }

  if (pathname === "/api/admin/bookings" && method === "GET") {
    if (!requireAdmin(req, res)) return;
    const rows = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
    return sendJSON(res, 200, { bookings: rows.map(bookingJSON) });
  }

  let m = pathname.match(/^\/api\/admin\/bookings\/([A-Za-z0-9-]+)$/);
  if (m && method === "PATCH") {
    if (!requireAdmin(req, res)) return;
    const code = m[1];
    const body = await readBody(req, 8192);
    const sets = [];
    const values = [];
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) throw httpError(400, "Trạng thái không hợp lệ");
      sets.push("status = ?");
      values.push(body.status);
    }
    if (body.note !== undefined) {
      sets.push("note = ?");
      values.push(str(body.note, 2000));
    }
    if (!sets.length) throw httpError(400, "Không có dữ liệu cần cập nhật");
    values.push(code);
    const info = db.prepare("UPDATE bookings SET " + sets.join(", ") + " WHERE code = ?").run(...values);
    if (!info.changes) throw httpError(404, "Không tìm thấy đơn");
    return sendJSON(res, 200, { booking: bookingJSON(getBookingRow(code)) });
  }

  if (m && method === "DELETE") {
    if (!requireAdmin(req, res)) return;
    const info = db.prepare("DELETE FROM bookings WHERE code = ?").run(m[1]);
    if (!info.changes) throw httpError(404, "Không tìm thấy đơn");
    return sendJSON(res, 200, { ok: true });
  }

  if (pathname === "/api/admin/tours" && method === "GET") {
    if (!requireAdmin(req, res)) return;
    return sendJSON(res, 200, { tours: toursWithOverrides() });
  }

  m = pathname.match(/^\/api\/admin\/tours\/([^/]+)$/);
  if (m && method === "PUT") {
    if (!requireAdmin(req, res)) return;
    const id = decodeURIComponent(m[1]);
    const base = BASE_TOURS.find((t) => t.id === id);
    if (!base) throw httpError(404, "Không tìm thấy tour");
    const body = await readBody(req, 4096);

    let price = null;
    if (body.price != null) {
      const n = Math.round(Number(body.price));
      if (!Number.isFinite(n) || n < 100000 || n > 200000000) throw httpError(400, "Giá tour không hợp lệ");
      price = n === base.price ? null : n;
    }
    const active = typeof body.active === "boolean" ? body.active : true;
    const featured = typeof body.featured === "boolean" ? body.featured : false;

    if (price == null && active && !featured) {
      db.prepare("DELETE FROM tour_overrides WHERE tour_id = ?").run(id);
    } else {
      db.prepare(
        "INSERT INTO tour_overrides (tour_id, price, active, featured) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT(tour_id) DO UPDATE SET price = excluded.price, active = excluded.active, featured = excluded.featured"
      ).run(id, price, active ? null : 0, featured ? 1 : null);
    }
    return sendJSON(res, 200, { tour: tourById(id) });
  }

  if (m && method === "DELETE") {
    if (!requireAdmin(req, res)) return;
    const id = decodeURIComponent(m[1]);
    if (!BASE_TOURS.some((t) => t.id === id)) throw httpError(404, "Không tìm thấy tour");
    db.prepare("DELETE FROM tour_overrides WHERE tour_id = ?").run(id);
    return sendJSON(res, 200, { tour: tourById(id) });
  }

  if (pathname === "/api/admin/admins" && method === "GET") {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const rows = db.prepare("SELECT * FROM admins ORDER BY id").all();
    return sendJSON(res, 200, { admins: rows.map((r) => adminJSON(r, admin.id)) });
  }

  if (pathname === "/api/admin/admins" && method === "POST") {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const body = await readBody(req, 4096);
    const username = str(body.username, 32).trim();
    const displayName = str(body.displayName, 80).trim() || username;
    const password = str(body.password, 200);
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) throw httpError(400, "Tên đăng nhập 3–32 ký tự, chỉ gồm chữ, số, dấu chấm, gạch");
    if (password.length < 8) throw httpError(400, "Mật khẩu phải có ít nhất 8 ký tự");
    if (db.prepare("SELECT id FROM admins WHERE username = ?").get(username)) throw httpError(409, "Tên đăng nhập đã tồn tại");
    const { salt, hash } = hashPassword(password);
    const info = db.prepare("INSERT INTO admins (username, display_name, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(username, displayName, hash, salt, new Date().toISOString());
    const row = db.prepare("SELECT * FROM admins WHERE id = ?").get(info.lastInsertRowid);
    return sendJSON(res, 201, { admin: adminJSON(row, admin.id) });
  }

  m = pathname.match(/^\/api\/admin\/admins\/(\d+)$/);
  if (m && method === "PATCH") {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const id = Number(m[1]);
    const row = db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
    if (!row) throw httpError(404, "Không tìm thấy tài khoản");
    const body = await readBody(req, 4096);
    const sets = [];
    const values = [];
    if (body.displayName !== undefined) {
      sets.push("display_name = ?");
      values.push(str(body.displayName, 80).trim() || row.username);
    }
    if (body.password !== undefined) {
      const password = str(body.password, 200);
      if (password.length < 8) throw httpError(400, "Mật khẩu phải có ít nhất 8 ký tự");
      const { salt, hash } = hashPassword(password);
      sets.push("password_hash = ?", "salt = ?");
      values.push(hash, salt);
      db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(id);
    }
    if (!sets.length) throw httpError(400, "Không có dữ liệu cần cập nhật");
    values.push(id);
    db.prepare("UPDATE admins SET " + sets.join(", ") + " WHERE id = ?").run(...values);
    const updated = db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
    return sendJSON(res, 200, { admin: adminJSON(updated, admin.id) });
  }

  if (m && method === "DELETE") {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const id = Number(m[1]);
    if (id === admin.id) throw httpError(400, "Không thể xóa tài khoản đang đăng nhập");
    const total = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
    if (total <= 1) throw httpError(400, "Phải còn ít nhất một tài khoản admin");
    const info = db.prepare("DELETE FROM admins WHERE id = ?").run(id);
    if (!info.changes) throw httpError(404, "Không tìm thấy tài khoản");
    return sendJSON(res, 200, { ok: true });
  }

  throw httpError(404, "Không tìm thấy API");
}

/* Static files ---------------------------------------------------------- */
function injectOverrides(html) {
  const tag = '<script src="js/app.js"></script>';
  const overridesTag = '<script src="/api/overrides.js"></script>';
  if (html.includes(tag)) return html.replace(tag, overridesTag + "\n  " + tag);
  return html.replace("</body>", overridesTag + "\n</body>");
}

async function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") throw httpError(405, "Phương thức không được hỗ trợ");

  let rel;
  try {
    rel = decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch (e) {
    throw httpError(400, "Đường dẫn không hợp lệ");
  }
  if (!rel || rel.endsWith("/")) rel += "index.html";

  const parts = rel.split("/");
  if (BLOCKED_ROOTS.has(parts[0]) || BLOCKED_FILES.has(parts[0]) || parts.some((p) => p.startsWith("."))) {
    throw httpError(404, "Không tìm thấy trang");
  }

  const filePath = resolve(rootDir, rel);
  if (!filePath.startsWith(rootDir + sep)) throw httpError(404, "Không tìm thấy trang");

  let info;
  try {
    info = await stat(filePath);
  } catch (e) {
    throw httpError(404, "Không tìm thấy trang");
  }
  if (!info.isFile()) throw httpError(404, "Không tìm thấy trang");

  const ext = extname(filePath).toLowerCase();
  let data = await readFile(filePath);
  if (ext === ".html") data = Buffer.from(injectOverrides(data.toString("utf8")), "utf8");

  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Content-Length": data.length,
    "Cache-Control": ext === ".html" ? "no-store" : "no-cache"
  });
  res.end(req.method === "HEAD" ? undefined : data);
}

const server = createServer(async (req, res) => {
  securityHeaders(res);
  let pathname;
  try {
    pathname = new URL(req.url, "http://localhost").pathname;
  } catch (e) {
    return sendJSON(res, 400, { error: "Yêu cầu không hợp lệ" });
  }

  try {
    if (pathname.startsWith("/api/")) await handleApi(req, res, pathname);
    else await serveStatic(req, res, pathname);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    if (!res.headersSent) sendJSON(res, status, { error: status >= 500 ? "Lỗi máy chủ" : err.message });
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log("Vietnam4trip chạy tại http://localhost:" + PORT);
  if (seededOwner) {
    console.log("Đã tạo tài khoản admin đầu tiên: " + seededOwner.username + " / " + seededOwner.password);
    if (!seededOwner.fromEnv) {
      console.log("Hãy đổi mật khẩu trong mục Tài khoản, hoặc đặt ADMIN_PASSWORD khi chạy trên máy chủ thật.");
    }
  }
});
