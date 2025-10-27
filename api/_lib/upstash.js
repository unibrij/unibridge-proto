import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_KV_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_KV_REST_TOKEN;

if (!url || !token) {
  console.error("[upstash] ❌ Missing Upstash credentials:", { url, token });
  throw new Error("Upstash credentials not found. Set UPSTASH_REDIS_REST_URL/TOKEN");
}

export const redis = new Redis({ url, token });

// ✅ اختبار مباشر للاتصال
(async () => {
  try {
    await redis.ping();
    console.log("[upstash] ✅ Connection test OK");
  } catch (err) {
    console.error("[upstash] ❌ Connection failed:", err.message);
  }
})();
