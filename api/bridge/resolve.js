// api/bridge/resolve.js
import { redis, getJSON } from "../_lib/upstash.js";
import crypto from "node:crypto";

function json(res, code, body){
  res.status(code).setHeader("content-type","application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

function header(headers, name){
  if(!headers) return undefined;
  const n = name.toLowerCase();
  for(const [k,v] of Object.entries(headers)){
    if(k.toLowerCase()===n) return Array.isArray(v)?v[0]:v;
  }
  return undefined;
}

function sha256Hex(s){
  return crypto.createHash("sha256").update(Buffer.from(s??"", "utf8")).digest("hex");
}

export default async function handler(req, res){
  try{
    if(req.method!=="GET"){ return json(res,405,{error:"method_not_allowed"}); }

    const apiKeyHeader = header(req.headers,"x-api-key");
    const API_KEY = process.env.API_KEY || process.env.CLIENT_KEY;
    if(!API_KEY || !apiKeyHeader || String(apiKeyHeader)!==String(API_KEY)){
      return json(res,401,{error:"unauthorized"});
    }

    const key = (req.query?.key || req.query?.k || "").toString().trim();
    if(!key){ return json(res,400,{error:"missing_key"}); }

    const k1 = `bridge:${key}`;
    let record = await getJSON(k1);
    if(!record){
      const k2 = `bridge:${sha256Hex(key)}`;
      record = await getJSON(k2);
    }
    if(!record){ return json(res,404,{error:"not_found"}); }

    return json(res,200,{status:"resolved", key, ...record});
  }catch(err){
    console.error("[resolve] internal error:", err);
    return json(res,500,{error:"internal_error"});
  }
}
