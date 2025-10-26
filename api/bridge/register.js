// api/bridge/register.js
import { cacheSet } from "../_lib/cache.js";
import { hashKey } from "../_lib/hmac.js";

function getHeader(req, name) {
  const h = req.headers || {};
  return h[name] || h[name.toLowerCase()] || h[name.toUpperCase()];
}

async function readJson(req, limitBytes = 1_000_000) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let len = 0;
  for await (const chunk of req) {
    chunks.push(chunk);
    len += chunk.length || chunk.byteLength || 0;
    if (len > limitBytes) {
      const e = new Error("body_too_large"); e.code = "BODY_TOO_LARGE"; throw e;
    }
  }
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) return {};
  try { return JSON.parse(text); } catch { throw new Error("invalid_json"); }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKeyHeader = getHeader(req, "x-api-key");
  const API_KEY = process.env.API_KEY || process.env.CLIENT_KEY;
  if (!API_KEY || !apiKeyHeader || String(apiKeyHeader) !== String(API_KEY)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  let body;
  try { body = await readJson(req); }
  catch (e) {
    return res.status(400).json({ error: e?.message || "invalid_json" });
  }

  const { key, wallet_id, anchor_id, provider_id } = body || {};
  if (!key || !wallet_id || !anchor_id) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const keyHash = hashKey(key, process.env.HMAC_SECRET);
    const record = { wallet_id, provider_id: provider_id || null, anchor_id };
    // cache namespace: resolve:<keyHash>
    await cacheSet(`resolve:${keyHash}`, record, 300);

    return res.status(201).json({ status: "created", key_hash: keyHash, wallet_id, anchor_id });
  } catch (err) {
    console.error("[register] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
