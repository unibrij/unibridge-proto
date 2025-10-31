// api/bridge/register.js
import { cacheSet } from "../_lib/cache.js";
import { readJson } from "../_lib/read-json.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  // فعّل CORS (Swagger / متصفح)
  applyCors(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // لازم POST حصراً
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // تحقق من الـ API key
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // اقرأ JSON body
  let body;
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const {
    key,
    wallet_id,
    anchor_id,
    provider_id,
    value,
    asset,
    network,
  } = body || {};

  if (!key) {
    return res.status(400).json({ error: "missing_fields" });
  }

  // جهّز السجل وخزّنه ب TTL = ساعة
  const record = {
    wallet_id,
    anchor_id,
    provider_id,
    value,
    asset,
    network,
    ts: Date.now(),
  };

  try {
    await cacheSet(key, record, 3600);
    return res.status(200).json({ ok: true, stored: record });
  } catch (err) {
    console.error("[register] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
