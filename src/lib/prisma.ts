import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString?.startsWith("postgres")) {
    throw new Error("DATABASE_URL harus berupa koneksi PostgreSQL");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Lazy singleton — only creates the client on first access, preventing
// build-time errors when DATABASE_URL is not available.
// Uses a plain function instead of Proxy to avoid intercepting
// Next.js internal property accesses.
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
