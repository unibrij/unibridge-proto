// api/bridge/resolve.js
import { cacheGet } from "../_lib/cache.js";  // من cache.js المصحح (async + JSON.parse)
import { pool, ensureSchema } from "../_lib/db.js";  // إضافة DB fallback
import crypto from "node:crypto";
import { hashKey, timingSafeEqual } from "../_lib/hmac.js";  // لـ HMAC و timing-safe check

// دالة موحدة لتنسيق الاستجابة بصيغة JSON
function json(res, code, body) {
  res
    .status(code)
    .setHeader("content-type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

// دالة لقراءة الهيدر بشكل آمن (case-insensitive)
function header(headers, name) {
  if (!headers) return undefined;
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === n) return Array.isArray(v) ? v[0] : v;
  }
  return undefined;
}

// 🔹 المعالج الرئيسي للـ endpoint
export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return json(res, 405, { error: "method_not_allowed" });
    }

    // ضمان الـ schema (مرة واحدة، لا يفشل إذا غاب DB)
    try {
      await ensureSchema();
    } catch (e) {
      console.error("[resolve] Schema init failed:", e);
      // استمر بدون DB
    }

    // تحقق من مفتاح الـ API باستخدام timingSafeEqual للأمان
    const apiKeyHeader = header(req.headers, "x-api-key");
    const API_KEY = process.env.API_KEY || process.env.CLIENT_KEY;
    if (!API_KEY || !apiKeyHeader) {
      return json(res, 401, { error: "unauthorized" });
    }
    if (!timingSafeEqual(apiKeyHeader, API_KEY)) {
      return json(res, 401, { error: "unauthorized" });
    }

    // استلام مفتاح bridge key المطلوب حله
    const key = (req.query?.key || req.query?.k || "").toString().trim();
    if (!key) return json(res, 400, { error: "missing_key" });

    // الحصول على HMAC secret للـ fallback hash
    const hmacSecret = process.env.HMAC_SECRET;
    let record = null;

    // تجربة البحث المباشر في الكاش
    const k1 = `bridge:${key}`;
    record = await cacheGet(k1);

    // تجربة البحث عبر HMAC hash (للتوافق مع register)
    if (!record && hmacSecret) {
      const key_hash = hashKey(key, hmacSecret);
      const k2 = `bridge:${key_hash}`;
      record = await cacheGet(k2);
    }

    // إذا لم يوجد في الكاش، جرب DB fallback (إذا متوفر)
    if (!record && pool) {
      try {
        // استخدم HMAC hash للبحث في DB (افتراض أن key_hash هو PRIMARY KEY)
        const searchHash = hmacSecret ? hashKey(key, hmacSecret) : key;  // fallback إلى plain إذا غاب secret
        const dbResult = await pool.query(
          'SELECT * FROM bkd_entries WHERE key_hash = $1 AND status = $2',
          [searchHash, 'active']
        );
        if (dbResult.rows.length > 0) {
          record = dbResult.rows[0];
          // أعد الكاش للأداء المستقبلي (استخدم key_hash كـ key)
          const cacheKey = hmacSecret ? `bridge:${hashKey(key, hmacSecret)}` : k1;
          // تصحيح: استخدم cacheSet بدلاً من cacheGet
          import { cacheSet } from "../_lib/cache.js";
          await cacheSet(cacheKey, record, 300);
        }
      } catch (dbErr) {
        console.error("[resolve] DB fallback failed:", dbErr);
        // لا تفشل الـ request
      }
    }

    // إذا لم يوجد أي تطابق
    if (!record) return json(res, 404, { error: "not_found" });

    // نجاح: إعادة السجل الكامل (مع إزالة sensitive fields إذا لزم، مثل updated_at)
    const { updated_at, ...safeRecord } = record;  // اختياري: أزل updated_at إذا لا تريده
    return json(res, 200, { status: "resolved", key, ...safeRecord });
  } catch (err) {
    console.error("[resolve] internal error:", err);
    return json(res, 500, { error: "internal_error", details: err.message });
  }
}
