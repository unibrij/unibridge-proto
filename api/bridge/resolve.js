// api/bridge/resolve.js
import { redis } from "../_lib/upstash.js";
import { hashKey } from "../_lib/hmac.js";

export default async function handler(req, res) {
  const { key } = req.query;
  const headerKey = req.headers["x-api-key"];
  const serverKey = process.env.API_KEY;

  if (!headerKey || headerKey !== serverKey)
    return res.status(401).json({ error: "unauthorized" });

  if (!key)
    return res.status(400).json({ error: "missing key" });

  try {
    // 🔹 نستخدم نفس التجزئة كما في register.js
    const keyHash = await hashKey(key);
    const result = await redis.get(keyHash);

    if (!result)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("[resolve]", err);
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
}
EOFcat > api/bridge/resolve.js <<'EOF'
// api/bridge/resolve.js
import { redis } from "../_lib/upstash.js";
import { hashKey } from "../_lib/hmac.js";

export default async function handler(req, res) {
  const { key } = req.query;
  const headerKey = req.headers["x-api-key"];
  const serverKey = process.env.API_KEY;

  if (!headerKey || headerKey !== serverKey)
    return res.status(401).json({ error: "unauthorized" });

  if (!key)
    return res.status(400).json({ error: "missing key" });

  try {
    // 🔹 نستخدم نفس التجزئة كما في register.js
    const keyHash = await hashKey(key);
    const result = await redis.get(keyHash);

    if (!result)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("[resolve]", err);
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
}
