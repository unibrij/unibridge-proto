// api/bridge/register.js
import { cacheSet } from "../../_lib/cache.js";
import { readJson } from "../../_lib/read-json.js";
import { applyCors } from "../../_lib/cors.js";

export default async function handler(req, res) {
  // تفعيل CORS للسماح بالوصول من أي واجهة (Swagger أو غيرها)
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  // السماح فقط بطريقة POST
  if (req.method !== "POST")
    return res.status(405).json({ error: "method_not_allowed" });

  // التحقق من مفتاح الـ API
  if (req.headers["x-api-key"] !== process.env.API_KEY)
    return res.status(401).json({ error: "unauthorized" });

  // قراءة جسم الطلب
  let body;
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const { key, wallet_id, anchor_id, provider_id, value, asset, network } = body || {};
  if (!key) return res.status(400).json({ error: "missing_fields" });

  // إنشاء سجل وتخزينه مؤقتًا في Upstash
  const record = { wallet_id, anchor_id, provider_id, value, asset, network, ts: Date.now() };
  await cacheSet(key, record, 3600);

  return res.status(200).json({ ok: true, stored: record });
}
