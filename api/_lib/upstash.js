// api/test-upstash.js
import { pingRedis } from "./_lib/upstash.js";

export default async function handler(req, res) {
  try {
    const result = await pingRedis();
    return res.status(200).json({
      status: "success",
      message: "Redis connection OK",
      result,
    });
  } catch (error) {
    console.error("[test-upstash] Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Redis connection failed",
      details: error.message || error.toString(),
    });
  }
}
