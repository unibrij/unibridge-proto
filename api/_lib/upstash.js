import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// اختبار الاتصال البسيط (اختياري)
export async function pingRedis() {
  return await redis.ping();
}

// دوال الكاش العامة
export async function cacheSet(key, value) {
  await redis.set(key, JSON.stringify(value));
  return true;
}

export async function cacheGet(key) {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

export async function cacheDel(key) {
  await redis.del(key);
  return true;
}

export default redis;
