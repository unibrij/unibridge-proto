import crypto from "node:crypto";

export const hashKey = (key, secret) =>
  crypto.createHmac("sha256", secret).update(key).digest("hex");
