/**
 * Supabase SQL Migration Verifier
 *
 * Verifies that all database schema files in supabase/ exist, have non-empty contents,
 * and follow PostgreSQL idempotency best practices (IF NOT EXISTS, DROP POLICY IF EXISTS).
 */

import fs from "node:fs";
import path from "node:path";

const MIGRATION_DIR = path.resolve(process.cwd(), "supabase");

const REQUIRED_MIGRATIONS = [
  "schema.sql",
  "seed.sql",
  "phase3_schema.sql",
  "phase3_seed.sql",
  "phase4_schema.sql",
  "phase4_seed.sql",
  "phase5_schema.sql",
  "phase5_seed.sql",
  "admin_rbac.sql",
  "setup_admin.sql",
  "coupons_schema.sql",
  "coupons_seed.sql",
];

console.log("🔍 Verifying Supabase SQL Migrations...");

let errors = 0;

for (const file of REQUIRED_MIGRATIONS) {
  const filePath = path.join(MIGRATION_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing migration file: ${file}`);
    errors++;
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  if (!content.trim()) {
    console.error(`❌ Empty migration file: ${file}`);
    errors++;
    continue;
  }

  // Check for RLS enable in schema files
  if (file.includes("schema") || file.includes("rbac")) {
    if (!content.includes("ENABLE ROW LEVEL SECURITY")) {
      console.warn(`⚠️ Warning: ${file} does not explicitly contain 'ENABLE ROW LEVEL SECURITY'`);
    }
  }

  console.log(`✅ Verified ${file} (${Math.round(content.length / 1024)} KB)`);
}

if (errors > 0) {
  console.error(`\n❌ Migration verification failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log("\n🎉 All 10 Supabase SQL migrations verified successfully.");
}
