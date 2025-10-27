import { Redis } from "@upstash/redis";

/* خُيارات القراءة من الـ ENV (أي واحد متوفر) */
const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.REDIS_URL;

const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN;

/* إن ما في مفاتيح على الإنتاج منستخدم ستَب صغيرة بدل الكلاينت */
const stub = {
  async get() { return null; },
  async set() { return "ok"; },
  async del() { return 1; },
};

export const redis = (url && token) ? new Redis({ url, token }) : stub;
export default redis;
