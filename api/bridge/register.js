// api/bridge/register.js
import { pool, ensureSchema } from "../../_lib/db.js";
import { hashKey } from "../../_lib/hmac.js";
import { cacheSet } from "../../_lib/cache.js";
import { readJson } from "../../_lib/read-json.js"; // ✨ قراءة JSON بشكل مضمون

export default async function handler(req, res) {
  // 🧩 1) نسمح فقط بطلبات POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 🔐 2) التحقق من مفتاح الوصول x-api-key
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // 📦 3) قراءة البيانات المرسلة (بدلاً من req.body)
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

  // 🧱 4) إنشاء الجدول في Postgres إذا لم يكن موجود
  await ensureSchema();

  // 🔑 5) توليد بصمة آمنة للمفتاح (hash)
  const key_hash = hashKey(key, process.env.HMAC_SECRET);

  // 🧠 6) حفظ البيانات بقاعدة Postgres وتخزينها مؤقتًا في Redis
  try {
    await pool.query(
      `INSERT INTO bkd_entries(key_hash, wallet_id, provider_id, anchor_id)
       VALUES($1,$2,$3,$4)
       ON CONFLICT (key_hash) DO UPDATE
         SET wallet_id=EXCLUDED.wallet_id,
             provider_id=EXCLUDED.provider_id,
             anchor_id=EXCLUDED.anchor_id,
             updated_at=NOW();`,
      [key_hash, wallet_id, provider_id || null, anchor_id]
    );

    // 🕒 حفظ نسخة في الكاش لمدة 5 دقائق (300 ثانية)
    await cacheSet(`resolve:${key_hash}`, { wallet_id, provider_id, anchor_id }, 300);

    // ✅ رد النجاح
    return res.status(201).json({
      status: "created",
      key_hash,
      wallet_id,
      anchor_id
    });

  } catch (e) {
    // ⚠️ معالجة الأخطاء
    return res.status(500).json({
      error: "db_error",
      detail: String(e.message || e)
    });
  }
}
