import { Client } from "pg";
import { hashSync } from "bcryptjs";
import { randomBytes } from "node:crypto";

const email = process.env.ADMIN_EMAIL || "admin@pendidikan.id";
const password = process.env.ADMIN_PASSWORD || "admin123";
const nama = process.env.ADMIN_NAMA || "Admin Pendidikan";
const resetPassword = process.env.RESET_ADMIN_PASSWORD === "true";

if (!process.env.DATABASE_URL) {
  console.error("[bootstrap-admin] DATABASE_URL tidak di-set, skip");
  process.exit(0);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

function cuid() {
  return "c" + Date.now().toString(36) + randomBytes(8).toString("hex");
}

try {
  await client.connect();
  const { rows } = await client.query(
    'SELECT id FROM "Admin" WHERE email = $1',
    [email],
  );

  if (rows.length === 0) {
    await client.query(
      'INSERT INTO "Admin" (id, nama, email, "passwordHash", role) VALUES ($1, $2, $3, $4, $5)',
      [cuid(), nama, email, hashSync(password, 10), "SUPER_ADMIN"],
    );
    console.log(`[bootstrap-admin] Admin dibuat: ${email}`);
  } else if (resetPassword) {
    await client.query(
      'UPDATE "Admin" SET "passwordHash" = $1 WHERE email = $2',
      [hashSync(password, 10), email],
    );
    console.log(`[bootstrap-admin] Password admin di-reset: ${email}`);
  } else {
    console.log(`[bootstrap-admin] Admin sudah ada: ${email} (skip)`);
  }
} catch (err) {
  console.error("[bootstrap-admin] Gagal:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
