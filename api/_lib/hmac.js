// api/_lib/hmac.js
import crypto from "node:crypto";

export function hmacSHA256Hex(secret, message){
  return crypto.createHmac("sha256", Buffer.from(secret??"", "utf8"))
               .update(Buffer.from(message??"", "utf8"))
               .digest("hex");
}

// إضافة hashKey كـ alias للتوافق مع register.js (wrapper بسيط)
export function hashKey(message, secret) {
  return hmacSHA256Hex(secret, message);  // ترتيب البارامترات: secret أول، message ثاني
}

export function timingSafeEqual(a,b){
  const ab = Buffer.from(a??"", "utf8");
  const bb = Buffer.from(b??"", "utf8");
  if(ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyHmac(secret, message, expectedHex){
  const sig = hmacSHA256Hex(secret, message);
  return timingSafeEqual(sig, expectedHex);
}
