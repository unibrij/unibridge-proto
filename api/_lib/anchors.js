// api/_lib/anchors.js
export const anchors = [
  { id: "MoneyGram_US", network: "MoneyGram", country: "US", payout_currencies: ["USD"] },
  { id: "MoneyGram_MX", network: "MoneyGram", country: "MX", payout_currencies: ["MXN"] },
  { id: "Anchor_BR_Local", network: "PartnerBR", country: "BR", payout_currencies: ["BRL"] }
];

// Helper function: true if both anchors belong to same network
export function sameNetwork(a, b) {
  return a.network === b.network;
}
