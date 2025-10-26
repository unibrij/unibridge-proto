// api/_lib/hmac.js
// Simple SHA-256 key hashing to normalize storage/lookup keys.

import crypto from "crypto";

export async function hashKey(key) {
  return crypto.createHash("sha256").update(String(key)).digest("hex");
}
