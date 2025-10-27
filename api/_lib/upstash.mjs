import { Redis } from "@upstash/redis";

let _client;

const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  // اترك السطر يتابع؛ بيئة الإنتاج عندك مهيئة، لكن لو فشلت رجّع خطأ واضح
  throw new Error("Upstash credentials not found (URL/TOKEN).");
}

export const redis = (_client ??= new Redis({ url, token }));
