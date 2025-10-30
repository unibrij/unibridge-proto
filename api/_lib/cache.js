// api/_lib/cache.js
import { redis } from "./upstash.js";

/**
 * Store value in cache.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSec] optional TTL in seconds
 */
export async function cacheSet(key, value, ttlSec) {
  if (!redis) {
    throw new Error("redis client not initialized");
  }

  const payload = typeof value === "string" ? value : JSON.stringify(value);

  if (ttlSec && Number(ttlSec) > 0) {
    await redis.set(key, payload, { ex: Number(ttlSec) });
  } else {
    await redis.set(key, payload);
  }

  return true;
}

/**
 * Read value from cache and JSON.parse if needed.
 * @param {string} key
 */
export async function cacheGet(key) {
  if (!redis) {
    throw new Error("redis client not initialized");
  }

  const raw = await redis.get(key);
  if (raw === null || raw === undefined) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
