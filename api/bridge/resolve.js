// api/bridge/resolve.js
// Unifies lookup key with register: compute the same key hash, then GET from Redis.

import { redis } from "../_lib/upstash.js";
import { hashKey } from "../_lib/hmac.js";

function getHeader(req, name) {
  // Vercel/Node headers are case-insensitive
  const h = req.headers || {};
  return h[name] || h[name.toLowerCase()] || h[name.toUpperCase()];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // API key check
  const apiKey = getHeader(req, "x-api-key");
  if (!apiKey || apiKey !== process.env.CLIENT_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // Read key from query
  const key = (req.query && (req.query.key || req.query["key"])) ?? null;
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    return res.status(400).json({ error: "missing_key" });
  }

  try {
    // Compute the same hash used on register
    const keyHash = await hashKey(key);

    // Fetch from Upstash Redis
    const record = await redis.get(keyHash);

    if (!record) {
      return res.status(404).json({ error: "not found" });
    }

    // If value was stored as JSON string, try to parse
    let data = record;
    if (typeof record === "string") {
      try {
        data = JSON.parse(record);
      } catch (_) {
        // keep as-is
      }
    }

    return res.status(200).json({
      status: "resolved",
      key,
      ...data
    });
  } catch (err) {
    console.error("resolve error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
