// api/bridge/resolve.js
// ✅ Lite: تعتمد على الكاش فقط (Upstash إن وُجد). بدون DB.
// تُعيد 404 إذا لم تجد السجل في الكاش.
// تعمل مع register-lite الذي يخزّن عند المفتاح: resolve:<key_hash>

import { hashKey } from "../_lib/hmac.js";

export default async function handler(req, res) {
  // 1) GET فقط
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 2) تحقق من x-api-key
  const headerKey = req.headers["x-api-key"];
  const serverKey = process.env.API_KEY;
  if (!serverKey || headerKey !== serverKey) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // 3) بارامتر key
  const key = req.query?.key;
  if (!key) return res.status(400).json({ error: "missing_key" });

  // 4) احسب نفس key_hash المستخدم في register-lite
  const hmacSecret = process.env.HMAC_SECRET || "temp-secret";
  let key_hash;
  try {
    key_hash = hashKey(key, hmacSecret);
  } catch (e) {
    return res.status(500).json({ error: "hash_error", detail: String(e?.message || e) });
  }

  // 5) جرّب القراءة من الكاش (اختياري؛ لا نفشل إن لم يكن مضبوطًا)
  try {
    const mod = await import("../_lib/cache.js").catch(() => null);
    const cacheGet = mod?.cacheGet;
    if (cacheGet) {
      const cached = await cacheGet(`resolve:${key_hash}`);
      if (cached) {
        return res.status(200).json(cached);
      }
    }
  } catch (e) {
    console.log("cacheGet failed:", e?.message || e);
  }

  // 6) لا توجد DB في النسخة Lite
  return res.status(404).json({ error: "not_found" });
}
