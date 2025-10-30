import { Pool } from "pg";

const connStr = process.env.DATABASE_URL;
export const pool = connStr
  ? new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false }, max: 3, idleTimeoutMillis: 10000 })
  : null;

export async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    create table if not exists bkd_entries (
      key_hash    text primary key,
      wallet_id   text not null,
      provider_id text,
      anchor_id   text not null,
      created_at  timestamptz not null default now(),
      updated_at  timestamptz not null default now()
    );
  `);
}

export default pool;