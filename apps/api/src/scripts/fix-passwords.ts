import argon2 from "argon2";
import { pool } from "../config/db";

async function fixPasswords() {
  const defaultPassword = "Password123!";
  const validHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await pool.query("UPDATE users SET password_hash = $1", [validHash]);
  console.log("✅ All seed user passwords updated with real Argon2id hash.");
  await pool.end();
}

fixPasswords().catch(console.error);
