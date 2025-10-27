import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("[upstash] ❌ Missing Upstash credentials.");
  throw new Error("Missing Upstash Redis credentials");
}

const redis = new Redis({ url, token });

console.log("[upstash] ✅ Connected to Upstash");

export { redis };
