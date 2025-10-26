// api/_lib/upstash.js
import { Redis } from "@upstash/redis";

function readEnv(keys){for(const k of keys){const v=process.env[k];if(v&&String(v).trim())return v;}return null;}

const url = readEnv(["UPSTASH_REDIS_REST_URL","UPSTASH_KV_REST_URL","UPSTASH_KV_URL"]);
const token = readEnv(["UPSTASH_REDIS_REST_TOKEN","UPSTASH_KV_REST_TOKEN","UPSTASH_KV_TOKEN"]);

if(!url||!token){console.error("[upstash] Missing Upstash credentials. url? %s token? %s",!!url,!!token);}

export const redis = new Redis({url, token});

export async function getJSON(key){
  const raw = await redis.get(key);
  if(raw==null) return null;
  if(typeof raw === "string"){ try{return JSON.parse(raw);}catch{return raw;} }
  return raw;
}

export async function setJSON(key, value, opts){
  const payload = typeof value === "string" ? value : JSON.stringify(value);
  if(opts?.ex){ return await redis.set(key, payload, { ex: opts.ex }); }
  return await redis.set(key, payload);
}
