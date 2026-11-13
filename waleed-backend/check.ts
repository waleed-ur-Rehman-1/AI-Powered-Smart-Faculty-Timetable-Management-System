import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("\n🔄 Connecting to database...");

  const depts = await pool.query('SELECT id, name FROM "Department"');
  console.log("✅ Departments found:", depts.rows.length);
  console.log(JSON.stringify(depts.rows, null, 2));

  const users = await pool.query('SELECT id, email, role FROM "User"');
  console.log("\n✅ Users found:", users.rows.length);
  console.log(JSON.stringify(users.rows, null, 2));

  await pool.end();
  console.log("\n🎉 Done!");
}

main().catch((e) => {
  console.error("❌ ERROR:", e.message);
  process.exit(1);
});
