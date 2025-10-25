import { createPool } from "@vercel/postgres";
export const pool = createPool({ connectionString: process.env.DATABASE_URL });

export async function ensureSchema(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bkd_entries(
      key_hash TEXT PRIMARY KEY,
      wallet_id TEXT,
      provider_id TEXT,
      anchor_id TEXT,
      status TEXT DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
