import { Redis } from "@upstash/redis";

// نقرأ القيم من Environment (اسمين بديلين للـ Upstash أو KV)
const url   = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let redis; // تصريح واحد فقط

if (!url || !token) {
  console.warn("[upstash] Missing credentials (URL/TOKEN). Skipping Redis client.");
  redis = undefined;
} else {
  console.log("[upstash] Connected to Upstash:", url);
  redis = new Redis({ url, token });
}

export { redis };
