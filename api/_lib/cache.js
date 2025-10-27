import { redis } from "./upstash.js";

export async function cacheSet(key, value, ttlSec = 3600) {
  return await redis.set(key, JSON.stringify(value), { ex: ttlSec });
}

export async function cacheGet(key) {
  const data = await redis.get(key);
  try { return JSON.parse(data); } catch { return data; }
}

export async function cacheDel(key) {
  return await redis.del(key);
}

export default { cacheSet, cacheGet, cacheDel };
