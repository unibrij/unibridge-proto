// api/bridge/register.js
// ✅ نسخة Lite: تعمل على Vercel حتى بدون Postgres/Redis.
// الهدف: إنجاح اختبار register الآن ثم نعيد ربط القاعدة لاحقًا.

import { hashKey } from "../../_lib/hmac.js";
import { readJson } from "../../_lib/read-json.js";

export default async function handler(req, res) {
  // 1) السماح لـ POST فقط
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 2) تحقق x-api-key مقابل متغير البيئة API_KEY
  const headerKey = req.headers["x-api-key"];
  const serverKey = process.env.API_KEY;
  if (!serverKey || headerKey !== serverKey) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // 3) قراءة JSON بأمان
  let body = {};
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const { key, wallet_id, anchor_id, provider_id } = body || {};
  if (!key || !wallet_id || !anchor_id) {
    return res.status(400).json({ error: "missing_fields" });
  }

  // 4) توليد بصمة المفتاح مع سر HMAC
  const hmacSecret = process.env.HMAC_SECRET || "temp-secret"; // مؤقتًا للاختبار
  let key_hash;
  try {
    key_hash = hashKey(key, hmacSecret);
  } catch (e) {
    return res.status(500).json({ error: "hash_error", detail: String(e?.message || e) });
  }

  // 5) محاولة حفظ نسخة بالكاش (اختياري — لا نفشل إذا غاب Upstash)
  try {
    const mod = await import("../../_lib/cache.js").catch(() => null);
    if (mod?.cacheSet) {
      await mod.cacheSet(`resolve:${key_hash}`, { wallet_id, provider_id, anchor_id }, 300); // 5 دقائق
    }
  } catch (e) {
    // لا نفشل بسبب الكاش — فقط نُسجّل إن لزم
    console.log("cacheSet failed:", e?.message || e);
  }

  // 6) ردّ النجاح — بدون قاعدة بيانات في النسخة Lite
  return res.status(201).json({
    status: "created",
    key_hash,
    wallet_id,
    anchor_id
  });
}