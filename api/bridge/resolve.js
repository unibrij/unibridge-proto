// api/bridge/resolve.js
import { cacheGet } from "../../_lib/cache.js";
import { hashKey } from "../../_lib/hmac.js";

function getHeader(req, name) {
  const h = req.headers || {};
  return h[name] || h[name.toLowerCase()] || h[name.toUpperCase()];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKeyHeader = getHeader(req, "x-api-key");
  const API_KEY = process.env.API_KEY || process.env.CLIENT_KEY;
  if (!API_KEY || !apiKeyHeader || String(apiKeyHeader) !== String(API_KEY)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const key = (req.query?.key || req.query?.k || "").toString().trim();
  if (!key) return res.status(400).json({ error: "missing_key" });

  try {
    const keyHash = hashKey(key, process.env.HMAC_SECRET);

    // First: namespaced hash key
    let record = await cacheGet(`resolve:${keyHash}`);

    // Optional backward-compat: plain key (if older writes existed)
    if (!record) {
      record = await cacheGet(`resolve:${key}`);
    }

    if (!record) return res.status(404).json({ error: "not_found" });

    return res.status(200).json({ status: "resolved", key, ...record });
  } catch (err) {
    console.error("[resolve] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
