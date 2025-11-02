// api/bridge/route-quote.js
import { corridors } from "../_lib/corridors.js";
import { anchors, sameNetwork } from "../_lib/anchors.js";
import { cacheSet } from "../_lib/cache.js";

function deriveSettlementMode(corridorId) {
  const c = corridors.find(c => c.corridor_id === corridorId);
  if (!c) return "inter-anchor";
  const fromA = anchors.find(a => a.id === c.origin_anchor);
  const toB = anchors.find(a => a.id === c.dest_anchor);
  return (fromA && toB && sameNetwork(fromA, toB)) ? "internal" : "inter-anchor";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (req.headers["x-api-key"] !== process.env.API_KEY) return res.status(401).json({ error: "unauthorized" });

  const { source, destination, corridor } = req.body || {};
  if (!source || !destination || !corridor || !source.amount || !source.currency ||
      !source.sender_key || !destination.currency || !destination.receiver_key)
    return res.status(400).json({ error: "missing_required_fields" });

  const settlement_mode = deriveSettlementMode(corridor);
  const fx_rate = 16.74, fee = 1.55;
  const amountOut = (parseFloat(source.amount) - fee) * fx_rate;
  const quote_id = `qt_${corridor.replace(/[^A-Za-z0-9]/g,"").toLowerCase()}_${Date.now()}`;

  await cacheSet(quote_id, { corridor, receiver_key: destination.receiver_key, settlement_mode }, { ttlSeconds: 120 });

  res.status(200).json({
    quote_id, corridor, receiver_key: destination.receiver_key, settlement_mode,
    amount_in: source.amount, amount_out: amountOut.toFixed(2),
    fx_rate, total_fees: fee.toFixed(2),
    note: settlement_mode === "internal"
      ? "Will settle inside same anchor network."
      : "Requires receiving anchor confirmation."
  });
}
