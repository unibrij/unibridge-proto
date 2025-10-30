import { pool, ensureSchema } from "../../_lib/db.js";
import { hashKey } from "../../_lib/hmac.js";
import { cacheSet } from "../../_lib/cache.js";
import { readJson } from "../../_lib/read-json.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (req.headers["x-api-key"] !== process.env.API_KEY) return res.status(401).json({ error: "unauthorized" });

  let body = {};
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const { key, wallet_id, anchor_id, provider_id } = body || {};
  if (!key || !wallet_id || !anchor_id)
    return res.status(400).json({ error: "missing_fields" });

  await ensureSchema();
  const key_hash = hashKey(key, process.env.HMAC_SECRET);

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

    await cacheSet(`resolve:${key_hash}`, { wallet_id, provider_id, anchor_id }, 300);
    return res.status(201).json({ status: "created", key_hash, wallet_id, anchor_id });
  } catch (e) {
    return res.status(500).json({ error: "db_error", detail: String(e.message || e) });
  }
}