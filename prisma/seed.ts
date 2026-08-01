import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

if (!process.env.DATABASE_URL?.startsWith("postgres")) {
  throw new Error("DATABASE_URL harus berupa koneksi PostgreSQL");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
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
