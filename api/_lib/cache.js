// api/_lib/cache.js
import { redis } from "./upstash.js";

/**
 * Store value in cache.
 * Always stringifies objects before storing.
 */
export async function cacheSet(key, value, ttlSec) {
  if (!redis) {
    throw new Error("redis client not initialized");
  }

  // جهّز الشي اللي رح نخزّنه
  let payload;
  if (typeof value === "string") {
    payload = value;
  } else {
    // خزّن كـ JSON string حقيقي
    payload = JSON.stringify(value);
  }

  if (ttlSec && Number(ttlSec) > 0) {
    await redis.set(key, payload, { ex: Number(ttlSec) });
  } else {
    await redis.set(key, payload);
  }

  return true;
}

/**
 * Read value from cache and return parsed object if possible.
 */
export async function cacheGet(key) {
  if (!redis) {
    throw new Error("redis client not initialized");
  }

  const raw = await redis.get(key);
  if (raw === null || raw === undefined) return null;

  // جرّب نفك JSON، ولو ما مشي رجّع السلسلة نفسها
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
