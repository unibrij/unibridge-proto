// api/_lib/upstash.js
import { Redis } from "@upstash/redis";

// نأخذ من REDIS أولاً، وإن لم تتوفر نستخدم KV
const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_KV_REST_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_KV_REST_TOKEN;

if (!url || !token) {
  throw new Error(
    "Upstash credentials not found. Set UPSTASH_REDIS_REST_URL/TOKEN or UPSTASH_KV_REST_URL/TOKEN"
  );
}

export const redis = new Redis({
 url, token });