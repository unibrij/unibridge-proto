import { redis } from "../_lib/upstash.js";
import { readJson } from "../_lib/read-json.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const { key } = body || {};
  if (!key) {
    return res.status(400).json({ error: "missing_key" });
  }

  try {
    const result = await redis.get(key);
    if (!result) return res.status(404).json({ error: "not_found" });

    return res.status(200).json({ ok: true, resolved: JSON.parse(result) });
  } catch (err) {
    console.error("[resolve] Redis error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
