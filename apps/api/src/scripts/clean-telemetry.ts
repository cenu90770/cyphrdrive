import { pool } from "../config/db";
import { redis } from "../config/redis";

async function clean() {
  console.log("--- PURGING ALL TELEMETRY & HOT CACHE ---");

  // 1. Truncate TimescaleDB hypertable
  await pool.query("TRUNCATE telemetry_logs CASCADE;");
  console.log('✅ PostgreSQL table "telemetry_logs" truncated.');

  // 2. Clear Redis live keys
  const keys = await redis.keys("vehicle:live:*");
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`✅ Cleared ${keys.length} live vehicle keys from Redis.`);
  }

  // 3. Confirm 0 rows
  const countRes = await pool.query("SELECT COUNT(*) FROM telemetry_logs;");
  console.log(`📊 Rows remaining in telemetry_logs: ${countRes.rows[0].count}`);

  await pool.end();
  await redis.quit();
}

clean().catch((err) => {
  console.error("Purge failed:", err);
  process.exit(1);
});
