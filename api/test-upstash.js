import redis, { pingRedis } from "./_lib/upstash.js";

export default async function handler(req, res) {
  try {
    const pong = await pingRedis();
    const tKey = "health:check";
    await redis.set(tKey, "ok", { ex: 30 });
    const val = await redis.get(tKey);

    return res.status(200).json({
      status: "success",
      ping: pong,
      write_read: val,
      url_set: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      token_set: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err?.message || "unknown",
    });
  }
}