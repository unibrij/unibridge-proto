import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_KV_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_KV_REST_TOKEN;

let redis;
if (!url || !token) {
  if (process.env.NODE_ENV !== "production") {
    const mem = new Map();
    redis = {
      async get(k){ return mem.get(k) ?? null; },
      async set(k,v){ mem.set(k, v); return "OK"; },
    };
  } else {
    throw new Error("Upstash credentials not found in production. Set UPSTASH_REDIS_REST_URL/TOKEN or UPSTASH_KV_REST_URL/TOKEN");
  }
} else {
  redis = new Redis({ url, token });
}

export { redis };
