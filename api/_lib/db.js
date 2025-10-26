// api/_lib/db.js
import { createPool } from "@vercel/postgres";
export const pool = createPool({ connectionString: process.env.DATABASE_URL });

export async function ensureSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bkd_entries (
        key_hash TEXT PRIMARY KEY NOT NULL,
        wallet_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        anchor_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("[db] Schema ensured successfully");
  } catch (error) {
    console.error("[db] Schema creation failed:", error);
    throw error;  // أعد الرمي للمعالجة في register
  }
}
