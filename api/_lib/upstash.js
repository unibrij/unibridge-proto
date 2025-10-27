import { Redis } from "@upstash/redis";

const url   = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // في الإنتاج لازم تكون المفاتيح موجودة من Vercel
  // (لو محليًا، ممكن تستخدم Redis.fromEnv() بديلًا)
  throw new Error("Upstash credentials not found in production. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
}

const redis = new Redis({ url, token });

// اختياري: سجّل سطرًا يظهر فقط وقت التشغيل (لن يظهر في الرد للمستخدم)
console.log("[upstash] Connection test OK");

export { redis };
