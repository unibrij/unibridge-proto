// api/_lib/hmac.js
import crypto from "node:crypto";

/**
 * If a secret is provided, returns HMAC-SHA256(key, secret) hex.
 * Otherwise returns SHA-256(key) hex.
 */
export function hashKey(key, secret) {
  const msg = Buffer.from(String(key ?? ""), "utf8");
  if (secret && String(secret).length > 0) {
    return crypto.createHmac("sha256", Buffer.from(String(secret), "utf8"))
                 .update(msg).digest("hex");
  }
  return crypto.createHash("sha256").update(msg).digest("hex");
}

/** Optional: timing-safe string compare (same-length only). */
export function timingSafeEqual(a, b) {
  const A = Buffer.from(String(a ?? ""), "utf8");
  const B = Buffer.from(String(b ?? ""), "utf8");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}
