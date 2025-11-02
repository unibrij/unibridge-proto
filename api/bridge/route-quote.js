// api/bridge/route-quote.js
// US→MX pilot corridor quote endpoint (live-static logic)
// Notes:
// - Requires x-api-key header matching process.env.API_KEY
// - Returns static FX/fee model, but includes dynamic quote_id timestamp
// - Includes receiver_key in the response for traceability / audit

export default async function handler(req, res) {
  // Enforce method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Enforce API key auth
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { source, destination, partner_id } = req.body || {};

  // Basic payload validation
  if (
    !source?.amount ||
    !source?.currency ||
    !source?.country ||
    !destination?.currency ||
    !destination?.country ||
    !destination?.receiver_key
  ) {
    return res.status(400).json({ error: "missing_required_fields" });
  }

  // Static live corridor model (US -> MX)
  const fx_rate = 17.1; // placeholder USD -> MXN rate
  const unibridge_fee_bps = 10; // 0.1%
  const total_fees = +(source.amount * 0.004).toFixed(2); // 0.4% fee model (demo)
  const amount_out = +((source.amount - total_fees) * fx_rate).toFixed(2);

  const mockQuote = {
    quote_id: `qt_usmx_${Date.now()}`,
    corridor: "US->MX",
    partner_id: partner_id || "corridor_US_MX_v1",
    receiver_key: destination.receiver_key, // <-- include receiver key explicitly
    amount_in: source.amount,
    amount_out,
    fx_rate,
    total_fees,
    unibridge_fee_bps,
    valid_for_seconds: 120,
    estimated_settlement_seconds: 60,
    path: ["Circle_USDC", "Stellar_USDC", "Bitso_MXN", "MX_Payout"],
    note: "Live-static US→MX corridor quote. FX/fees are placeholders."
  };

  return res.status(200).json(mockQuote);
}
