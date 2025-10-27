import { Redis } from '@upstash/redis';

const url   = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error('Upstash credentials not found in production. Set UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN');
}

export const redis = new Redis({ url, token });
