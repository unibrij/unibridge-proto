// api/bridge/register.js
import { hashKey, timingSafeEqual } from "../_lib/hmac.js";  // HMAC للـ hash و timing-safe check
import { readJson } from "../_lib/read-json.js";  // قراءة JSON آمنة
import { pool, ensureSchema } from "../_lib/db.js";  // DB للحفظ الدائم
import { cacheSet } from "../_lib/cache.js";  // Cache للأداء (async + JSON)

export default async function handler(req, res) {
  // 1) السماح لـ POST فقط
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 2) تحقق x-api-key باستخدام timingSafeEqual للأمان (مع logs للديباج)
  const headerKey = req.headers["x-api-key"];
  const serverKey = process.env.API_KEY;
  console.log("[register] Received header key:", headerKey || "undefined");  // ديباج: header
  console.log("[register] Expected env key:", serverKey || "undefined");  // ديباج: env var
  if (!serverKey || !headerKey) {
    console.log("[register] Unauthorized: missing key");
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!timingSafeEqual(headerKey, serverKey)) {
    console.log("[register] Unauthorized: mismatch");  // ديباج: عدم تطابق
    return res.status(401).json({ error: "unauthorized" });
  }
  console.log("[register] API key validated OK");  // ديباج: نجاح

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

  // 4) توليد بصمة المفتاح مع HMAC
  const hmacSecret = process.env.HMAC_SECRET;  // تأكد من env var!
  if (!hmacSecret) {
    console.error("[register] HMAC_SECRET missing");
    return res.status(500).json({ error: "config_error", detail: "HMAC_SECRET missing" });
  }
  let key_hash;
  try {
    key_hash = hashKey(key, hmacSecret);
  } catch (e) {
    console.error("[register] Hash error:", e);
    return res.status(500).json({ error: "hash_error", detail: String(e?.message || e) });
  }

  // 5) ضمان الـ schema (مرة واحدة)
  let dbSuccess = false;
  try {
    await ensureSchema();
  } catch (e) {
    console.error("[register] Schema init failed:", e);
    // استمر، نفترض الجدول موجود
  }

  // 6) حفظ في DB (upsert)
  try {
    const result = await pool.query(`
      INSERT INTO bkd_entries (key_hash, wallet_id, provider_id, anchor_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key_hash) DO UPDATE SET
        wallet_id = EXCLUDED.wallet_id,
        provider_id = EXCLUDED.provider_id,
        anchor_id = EXCLUDED.anchor_id,
        updated_at = NOW()
      RETURNING key_hash;
    `, [key_hash, wallet_id, provider_id, anchor_id]);
    dbSuccess = result.rows.length > 0;
    console.log("[register] DB save OK:", dbSuccess);  // ديباج
  } catch (e) {
    console.error("[register] DB insert failed:", e);
    // لا نفشل الـ request
  }

  // 7) حفظ في الكاش (مع TTL 300s)
  const cacheData = { wallet_id, provider_id, anchor_id, status: 'active' };
  try {
    await cacheSet(`bridge:${key_hash}`, cacheData, 300);
    console.log("[register] Cache set OK");  // ديباج
  } catch (e) {
    console.error("[register] Cache set failed:", e);
    // لا نفشل هنا
  }

  // 8) ردّ النجاح
  return res.status(dbSuccess ? 201 : 200).json({
    status: "created",
    key_hash,
    wallet_id,
    anchor_id,
    persisted: dbSuccess  // للديباج
  });
}
