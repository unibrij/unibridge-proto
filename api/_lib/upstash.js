// api/_lib/upstash.js — Upstash (إن وُجدت) وإلا fallback بالذاكرة
import { Redis } from "@upstash/redis";

const url   = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_KV_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_KV_REST_TOKEN;
const isProd = process.env.NODE_ENV === "production";

// لو إنتاج وما في مفاتيح → امنع التشغيل بوضوح
if (isProd && (!url || !token)) {
  throw new Error(
    "Upstash credentials not found in production. Set UPSTASH_REDIS_REST_URL/TOKEN or UPSTASH_KV_REST_URL/TOKEN"
  );
}

let redis;

// إذا في مفاتيح → استخدم Upstash فعليًا
if (url && token) {
  redis = new Redis({ url, token });
} else {
  // Fallback للذاكرة (للتطوير المحلي فقط)
  const store = new Map();
  redis = {
    async get(k) { return store.get(k) ?? null; },
    async set(k, v, opts = {}) {
      store.set(k, v);
      // TTL بالثواني إن توفّرت { ex: 60 }
      if (opts.ex) {
        const t = setTimeout(() => store.delete(k), opts.ex * 1000);
        t.unref?.();
      }
      return "OK";
    },
    async del(k) { const had = store.delete(k); return had ? 1 : 0; },
  };
  console.warn("[upstash] Using in-memory store (dev fallback).");
}

export default redis;

export async function pingRedis() {
  await redis.set("test:ping", "pong", { ex: 30 });
  return await redis.get("test:ping");
}
