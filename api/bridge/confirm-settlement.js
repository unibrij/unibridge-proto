// api/bridge/confirm-settlement.js
//
// Inter-Anchor Confirmation Endpoint
// ----------------------------------
// هذا المسار بيمثّل "المصادقة النهائية" من الـanchor المستقبل.
// يعني: بعد ما /bridge/settle يرجّع status=pending_anchor_confirmation
// بيجي الـreceiving anchor (أو sandbox تبعو) و بينادي هالمسار ليأكد إنه الدفع فعلاً انصرف.
//
// الحالة بعد التأكيد: "completed_cross_anchor"
//
// Env deps: process.env.API_KEY
//
// Expected request body:
// {
//   "settlement_id": "stl_1762049385850",
//   "receiver_key": "bkd:br_lucas901",
//   "anchor_conf_ref": "BRL-LOCAL-LEDGER-REF#9988"
// }
//
// Response:
// {
//   "settlement_id": "...",
//   "status": "completed_cross_anchor",
//   "receiver_key": "...",
//   "anchor_confirmation_ref": "...",
//   "note": "Final confirmation received from receiving anchor. Cross-anchor settlement completed."
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

  // 3. Parse body
  const { settlement_id, receiver_key, anchor_conf_ref } = req.body || {};

  if (!settlement_id || !receiver_key) {
    return res.status(400).json({
      error: "missing_required_fields",
      required: ["settlement_id", "receiver_key"]
    });
  }

  const responsePayload = {
    settlement_id,
    status: "completed_cross_anchor",
    receiver_key,
    anchor_confirmation_ref: anchor_conf_ref || null,
    note:
      "Final confirmation received from receiving anchor. Cross-anchor settlement completed. Sandbox mode, no real funds moved."
  };

  return res.status(200).json(responsePayload);
}
