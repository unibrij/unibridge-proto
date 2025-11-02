// api/bridge/settle.js
//
// Functional Prototype: Settlement Layer
// This endpoint pretends to execute a settlement for a previously accepted quote.
// Two modes:
//  - "internal": same anchor both ends (e.g. MoneyGram_US -> MoneyGram_MX)
//  - "inter-anchor": different anchors (e.g. MoneyGram_US -> Anchor_BR_Local)
//
// This is sandbox/staged mode. No real funds move.
// Later we will plug partner-specific hooks (e.g. moneygram.js) here.
//
// Env deps: process.env.API_KEY
//
// Expected request body example:
// {
//   "quote_id": "qt_usmx_1730468413",
//   "sender_key": "bkd:us_john774",
//   "receiver_key": "bkd:mxluis333",
//   "settlement_mode": "internal"
// }

export default async function handler(req, res) {
  // 1. Method check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 2. Simple API key auth
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // 3. Pull request body
  const { quote_id, sender_key, receiver_key, settlement_mode } = req.body || {};

  if (!quote_id || !sender_key || !receiver_key) {
    return res.status(400).json({
      error: "missing_required_fields",
      required: ["quote_id", "sender_key", "receiver_key"]
    });
  }

  // 4. Determine mode (default internal)
  const mode = settlement_mode === "inter-anchor" ? "inter-anchor" : "internal";

  // 5. Build mock responses
  if (mode === "internal") {
    // same network both ends (ex: MoneyGram -> MoneyGram)
    return res.status(200).json({
      settlement_id: `stl_${Date.now()}`,
      status: "completed_internal",
      corridor: "US->MX",
      anchor_from: "MoneyGram_US",
      anchor_to: "MoneyGram_MX",
      receiver_key,
      delivered_amount: "98.45",
      delivered_currency: "MXN",
      settlement_mode: "internal",
      note:
        "Settlement completed within the same anchor network (intra-anchor). No external handoff required. Sandbox mode, no real funds moved."
    });
  }

  // 6. inter-anchor flow (handoff to distinct receiving anchor)
  return res.status(200).json({
    settlement_id: `stl_${Date.now()}`,
    status: "pending_anchor_confirmation",
    corridor: "US->BR",
    anchor_from: "MoneyGram_US",
    anchor_to: "Anchor_BR_Local",
    receiver_key,
    delivered_amount: null,
    delivered_currency: null,
    settlement_mode: "inter-anchor",
    note:
      "Settlement requested across two different anchors. Awaiting receiving anchor confirmation. Sandbox mode, no real funds moved."
  });
}
