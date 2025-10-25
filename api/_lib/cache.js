import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const cacheGet = (k) => redis.get(k);
export const cacheSet = (k, v, ttl = 300) => redis.set(k, v, { ex: ttl });
