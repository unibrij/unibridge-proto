// api/_lib/cache.js
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const cacheGet = async (k) => {
  const value = await redis.get(k);
  return value ? JSON.parse(value) : null;  // إضافة parse
};

export const cacheSet = async (k, v, ttl = 300) => {
  await redis.set(k, JSON.stringify(v), { ex: ttl });  // إضافة stringify
  return true;
};

// إضافة pingRedis للتوافق مع test-upstash (اختبار الاتصال)
export async function pingRedis() {
  return await redis.ping();
}
