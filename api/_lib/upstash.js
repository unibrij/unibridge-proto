import { Redis } from "@upstash/redis";

const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_KV_REST_URL;

const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.UPSTASH_KV_REST_TOKEN;

if (!url || !token) {
  console.error("[upstash] Missing credentials:", {
    hasUrl: !!url,
    hasToken: !!token,
    env: process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV !== "production") {
    console.warn("[upstash] Using in-memory fallback (development only)");
    const memoryStore = new Map();
    export const redis = {
      async get(key) {
        return memoryStore.get(key) ?? null;
      },
      async set(key, value) {
        memoryStore.set(key, value);
        return "OK";
      },
    };
  } else {
    throw new Error(
      "Upstash credentials not found in production. Set UPSTASH_REDIS_REST_URL/TOKEN or UPSTASH_KV_REST_URL/TOKEN"
    );
  }
} else {
  console.log("[upstash] Connected to Upstash:", url);
  export const redis = new Redis({ url, token });
}
