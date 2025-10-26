// api/_lib/cache.js
import redis from "./upstash.js";

/**
 * Set a JSON-safe value in Redis.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSec] - optional TTL in seconds
 */
export async function cacheSet(key, value, ttlSec) {
  const payload = typeof value === "string" ? value : JSON.stringify(value);
  if (ttlSec && Number(ttlSec) > 0) {
    await redis.set(key, payload, { ex: Number(ttlSec) });
  } else {
    await redis.set(key, payload);
  }
  return true;
}

/**
 * Get a JSON-safe value from Redis.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function cacheGet(key) {
  const v = await redis.get(key);
  if (v == null) return null;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

export async function cacheDel(key) {
  await redis.del(key);
  return true;
}

export default { cacheSet, cacheGet, cacheDel };
