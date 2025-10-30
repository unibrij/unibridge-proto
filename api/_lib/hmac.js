import { createHmac, timingSafeEqual as tse } from "crypto";

/** يولّد هاش ثابت من المفتاح المرسل */
export function hashKey(key) {
  const secret = process.env.API_KEY || "dev-secret";
  return createHmac("sha256", secret).update(String(key)).digest("hex");
}

/** مقارنة آمنة زمنيًا لسلاسل/بفرات */
export function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  try { return tse(aBuf, bBuf); } catch { return false; }
}
