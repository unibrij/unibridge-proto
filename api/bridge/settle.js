// api/bridge/settle.js (fixed for current cache.js signature)
import { cacheGet } from "../_lib/cache.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (req.headers["x-api-key"] !== process.env.API_KEY) return res.status(401).json({ error: "unauthorized" });

  const { quote_id, sender_key, receiver_key } = req.body || {};
  if (!quote_id || !sender_key || !receiver_key)
    return res.status(400).json({ error: "missing_required_fields" });

  let quote;
  try {
    quote = await cacheGet(quote_id);
    console.log("Fetched quote:", quote_id, quote);
  } catch (err) {
    console.error("Cache error while fetching quote:", err);
    return res.status(500).json({ error: "cache_unavailable" });
  }

  if (!quote) return res.status(400).json({ error: "invalid_or_expired_quote" });

  const mode = quote.settlement_mode || "inter-anchor";

  if (mode === "internal")
    return res.status(200).json({
      settlement_id: `stl_${Date.now()}`,
      status: "completed_internal",
      corridor: quote.corridor,
      receiver_key,
      settlement_mode: mode,
      note: "Settlement completed within the same anchor network (intra-anchor). Sandbox mode."
    });

  return res.status(200).json({
    settlement_id: `stl_${Date.now()}`,
    status: "pending_anchor_confirmation",
    corridor: quote.corridor,
    receiver_key,
    settlement_mode: mode,
    note: "Settlement requested across different anchors. Awaiting receiving anchor confirmation."
  });
}
