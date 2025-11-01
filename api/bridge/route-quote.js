// api/bridge/route-quote.js

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "method_not_allowed" });

  // نفس طريقة الحماية الحالية تبعك، بدون ما نغيرها هلأ
  if (req.headers["x-api-key"] !== process.env.API_KEY)
    return res.status(401).json({ error: "unauthorized" });

  const { source, destination, partner_id } = req.body || {};

  // تحقق خفيف على الداتا
  if (!source?.amount || !destination?.receiver_key) {
    return res.status(400).json({ error: "missing_required_fields" });
  }

  // US -> MX corridor (live-static placeholder values)
  const fx_rate = 17.10;              // USD→MXN تقريبي placeholder
  const unibridge_fee_bps = 10;       // 0.1%
  const total_fees = +(source.amount * 0.004).toFixed(2); // 0.4% مؤقتًا
  const amount_out = +((source.amount - total_fees) * fx_rate).toFixed(2);

  return res.status(200).json({
    quote_id: `qt_usmx_${Date.now()}`,
    corridor: "US->MX",
    partner_id: partner_id || "corridor_US_MX_v1",
    amount_in: source.amount,
    amount_out,
    fx_rate,
    total_fees,
    unibridge_fee_bps,
    valid_for_seconds: 120,
    estimated_settlement_seconds: 60,
    path: ["Circle_USDC", "Stellar_USDC", "Bitso_MXN", "MX_Payout"],
    note: "Live-static US→MX corridor quote. FX/fees are placeholders.",
  });
}
