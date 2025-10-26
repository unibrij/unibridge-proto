// api/_lib/upstash.js
// Upstash Redis client (REST) - used by register/resolve handlers.

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
