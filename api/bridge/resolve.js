// api/bridge/resolve.js
import { cacheGet } from "../_lib/cache.js";

function getHeader(req, name) {
  const h = req.headers || {};
  return h[name] || h[name.toLowerCase()] || h[name.toUpperCase()];
}

export default async function handler(req, res) {
  // نسخة البروتوتايب الحالية تعتمد POST/JSON؟ لا.
  // بدنا GET مع query حتى يشتغل curl اللي انت عملته.
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // نفس طريقة التحقق من الـ API key اللي اعتمدناها (مرنة)
  const apiKeyHeader = getHeader(req, "x-api-key");
  const API_KEY = process.env.API_KEY || process.env.CLIENT_KEY;
  if (!API_KEY || !apiKeyHeader || String(apiKeyHeader) !== String(API_KEY)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // اخذ المفتاح من query (?key=demo-key)
  const key = (req.query?.key || req.query?.k || "").toString().trim();
  if (!key) {
    return res.status(400).json({ error: "missing_key" });
  }

  try {
    // مهم: نقرأ نفس الـ key الخام اللي سجله register
    const record = await cacheGet(key);

    if (!record) {
      return res.status(404).json({ error: "not_found" });
    }

    // رجّع نفس البيانات اللي خزّناها (wallet_id, anchor_id, provider_id...)
    return res.status(200).json({
      status: "resolved",
      key,
      ...record,
    });
  } catch (err) {
    console.error("[resolve] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
