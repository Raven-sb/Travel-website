import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function checkPassword(password, salt, hash) {
  const calc = scryptSync(password, salt, 64);
  const stored = Buffer.from(String(hash), "hex");
  return calc.length === stored.length && timingSafeEqual(calc, stored);
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
