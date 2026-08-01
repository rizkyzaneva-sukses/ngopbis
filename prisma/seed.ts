import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { email: "admin@pendidikan.id" },
  });

  if (!existing) {
    await prisma.admin.create({
      data: {
        nama: "Admin Pendidikan",
        email: "admin@pendidikan.id",
        passwordHash: hashSync("admin123", 10),
        role: "SUPER_ADMIN",
      },
    });
    console.log("Admin user created: admin@pendidikan.id / admin123");
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
