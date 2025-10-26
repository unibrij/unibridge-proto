// api/bridge/resolve.js
import { redis, cacheGet as getJSON } from "../_lib/upstash.js";
import crypto from "node:crypto";

// دالة موحدة لتنسيق الاستجابة بصيغة JSON
function json(res, code, body) {
  res
    .status(code)
    .setHeader("content-type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

// دالة لقراءة الهيدر بشكل آمن (case-insensitive)
function header(headers, name) {
  if (!headers) return undefined;
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === n) return Array.isArray(v) ? v[0] : v;
  }
  return undefined;
}

// دالة لتوليد SHA-256 كـ Hex
function sha256Hex(s) {
  return crypto
    .createHash("sha256")
    .update(Buffer.from(s ?? "", "utf8"))
    .digest("hex");
}

// 🔹 المعالج الرئيسي للـ endpoint
export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return json(res, 405, { error: "method_not_allowed" });
    }

    // تحقق من مفتاح الـ API
    const apiKeyHeader = header(req.headers, "x-api-key");
    const API_KEY = process.env.API_KEY || process.env.CLIENT_KEY;
    if (!API_KEY || !apiKeyHeader || String(apiKeyHeader) !== String(API_KEY)) {
      return json(res, 401, { error: "unauthorized" });
    }

    // استلام مفتاح bridge key المطلوب حله
    const key = (req.query?.key || req.query?.k || "").toString().trim();
    if (!key) return json(res, 400, { error: "missing_key" });

    // تجربة البحث المباشر
    const k1 = `bridge:${key}`;
    let record = await getJSON(k1);

    // تجربة البحث عبر hash ثانٍ (في حال المفتاح مشفّر)
    if (!record) {
      const k2 = `bridge:${sha256Hex(key)}`;
      record = await getJSON(k2);
    }

    // إذا لم يوجد أي تطابق
    if (!record) return json(res, 404, { error: "not_found" });

    // نجاح: إعادة السجل الكامل
    return json(res, 200, { status: "resolved", key, ...record });
  } catch (err) {
    console.error("[resolve] internal error:", err);
    return json(res, 500, { error: "internal_error" });
  }
}
