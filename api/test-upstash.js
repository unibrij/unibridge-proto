// api/test-upstash.js
import { pingRedis } from "../_lib/cache.js";  // غيّر من upstash.js إلى cache.js

/**
 * Endpoint لفحص اتصال Upstash Redis
 * عندما تفتح /api/test-upstash من المتصفح أو عبر curl،
 * يقوم بطلب PING إلى Redis ويعيد النتيجة كـ JSON.
 */
export default async function handler(req, res) {
  try {
    const result = await pingRedis();
    res.status(200).json({
      status: "success",
      message: "Redis connection OK",
      result,
    });
  } catch (error) {
    console.error("[test-upstash] Error:", error);
    res.status(500).json({
      status: "error",
      message: "Redis connection failed",
      details: error.message || error.toString(),
    });
  }
}
