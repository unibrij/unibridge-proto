// api/bridge/route-quote.js
//
// Functional Prototype: Route-Quote Layer
// Generates a pricing quote for a given sender -> receiver corridor.
// This is sandbox logic (no live FX / no live liquidity).
//
// Env deps: process.env.API_KEY
//
// Request body expected (example):
// {
//   "source": {
//     "amount": "100.00",
//     "currency": "USD",
//     "sender_key": "bkd:us_john774"
//   },
//   "destination": {
//     "currency": "MXN",
//     "receiver_key": "bkd:mxluis333"
//   },
//   "corridor": "US->MX"
// }
//
// Response includes:
// - receiver_key      (binds quote to a specific beneficiary)
// - settlement_mode   ("internal" if same anchor both ends)
// - path              (how value will conceptually move)
// - valid_for_seconds (quote TTL)

export default async function handler(req, res) {
  // 1. Method check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 2. Simple API key auth
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // 3. Extract request body
  const { source, destination, corridor, settlement_mode } = req.body || {};

  if (
    !source ||
    !destination ||
    !source.amount ||
    !source.currency ||
    !source.sender_key ||
    !destination.currency ||
    !destination.receiver_key ||
    !corridor
  ) {
    return res.status(400).json({
      error: "missing_required_fields",
      required: [
        "source.amount",
        "source.currency",
        "source.sender_key",
        "destination.currency",
        "destination.receiver_key",
        "corridor"
      ]
    });
  }

  // 4. Mock FX + fees logic (static for prototype)
  // amount_in = source.amount
  // For demo we'll pretend:
  // - FX rate ~16.74
  // - fee total ~1.55 USD equivalent
  // - unibridge_fee_bps ~10 bps (0.1%)
  // NOTE: All static demo values can later be replaced by live pricing.

  const fx_rate = 16.74; // mock
  const amountInFloat = parseFloat(source.amount);
  const totalFeesFloat = 1.55; // mock USD fees
  const amountOutFloat = (amountInFloat - totalFeesFloat) * fx_rate;

  const quoteId = `qt_${corridor.replace(/[^A-Za-z0-9]/g, "").toLowerCase()}_${Date.now()}`;

  // 5. Decide path + settlement mode
  // If caller didn't send a settlement_mode, assume "internal"
  // internal  -> same anchor on both ends (ex: MoneyGram_US -> MoneyGram_MX)
  // inter-anchor -> two different anchors (ex: MoneyGram_US -> Anchor_BR_Local)
  const mode = settlement_mode === "inter-anchor" ? "inter-anchor" : "internal";

  let path;
  if (mode === "internal") {
    // Example: same global network doing payout in destination country
    path = [
      "MoneyGram_US",
      "MoneyGram_MX",
      "Cashout_or_Wallet_Payout"
    ];
  } else {
    // Example: handoff to an external anchor in the destination
    path = [
      "MoneyGram_US",
      "Anchor_BR_Local",
      "Local_Payout"
    ];
  }

  // 6. Build response object
  const responsePayload = {
    quote_id: quoteId,
    corridor,
    receiver_key: destination.receiver_key, // <-- binds the quote to the actual intended beneficiary
    settlement_mode: mode,                  // "internal" vs "inter-anchor"
    amount_in: source.amount,
    amount_in_currency: source.currency,
    amount_out: amountOutFloat.toFixed(2),
    amount_out_currency: destination.currency,
    fx_rate,
    total_fees: totalFeesFloat.toFixed(2),
    unibridge_fee_bps: 10, // mock 0.1%
    valid_for_seconds: 120,
    estimated_settlement_seconds: mode === "internal" ? 60 : 180,
    path,
    note:
      mode === "internal"
        ? "Live-static US->MX corridor quote. FX/fees are placeholders. Settlement assumed inside same anchor network."
        : "Live-static cross-anchor quote. FX/fees are placeholders. Settlement will require receiving anchor confirmation."
  };

  return res.status(200).json(responsePayload);
}
