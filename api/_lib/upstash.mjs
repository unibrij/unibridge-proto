import { Redis } from "@upstash/redis";

// نقرأ المتغيرات من بيئة Vercel (Environment Variables)
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_KV_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_KV_REST_TOKEN;

// تحقّق من وجود القيم المطلوبة
if (!url || !token) {
  console.error("[upstash] Missing Upstash credentials:", { hasUrl: !!url, hasToken: !!token });
  throw new Error("[upstash] Missing Upstash REST credentials (url/token)");
}

// إنشاء عميل Redis باستخدام REST API
export const redis = new Redis({ url, token });

// اختبار الاتصال (اختياري)
export async function pingRedis() {
  try {
    await redis.set("test:ping", "pong");
    const result = await redis.get("test:ping");
    console.log("[upstash] Redis connection OK:", result);
    return result;
  } catch (err) {
    console.error("[upstash] Redis connection failed:", err);
    throw err;
  }
}
