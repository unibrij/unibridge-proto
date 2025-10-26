// upstash.js - مكتبة Redis للكاش باستخدام Upstash
import { Redis } from "@upstash/redis";

// إنشاء عميل Redis (client)
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// تصدير redis كـ named export (عشان resolve.js يقدر يستورده بـ { redis })
// كمان، default export للتوافق مع imports أخرى
export const redis = redisClient;
export default redisClient;

// اختبار الاتصال البسيط (اختياري - استخدمه للـ debug)
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
