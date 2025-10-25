import { pool, ensureSchema } from "../../_lib/db.js";
import { hashKey } from "../../_lib/hmac.js";
import { cacheGet, cacheSet } from "../../_lib/cache.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "method_not_allowed" });
    }
    if (req.headers["x-api-key"] !== process.env.API_KEY) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const key = (req.query.key || "").toString();
    if (!key) return res.status(400).json({ error: "missing_key" });

    const key_hash = hashKey(key, process.env.HMAC_SECRET);

    // 1) حاول من الكاش أولاً
    const cached = await cacheGet(`resolve:${key_hash}`);
    if (cached) return res.status(200).json(cached);

    // 2) تأكد من السكيمة ثم استعلم
    await ensureSchema();
    const { rows } = await pool.query(
      "SELECT wallet_id, provider_id, anchor_id FROM bkd_entries WHERE key_hash=$1 LIMIT 1",
      [key_hash]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "not_found", key_hash });
    }

    const payload = rows[0];

    // 3) خزّن في الكاش 5 دقائق
    await cacheSet(`resolve:${key_hash}`, payload, 300);

    return res.status(200).json(payload);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "db_error", detail: String(e?.message || e) });
  }
}
