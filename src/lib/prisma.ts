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
// build-time errors when DATABASE_URL is not available
export const prisma = (() => {
  const getter = () => {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  };
  // Return a Proxy that delegates all property access to the lazy client
  return new Proxy({} as PrismaClient, {
    get(_target, prop, receiver) {
      const client = getter();
      const value = Reflect.get(client, prop, receiver);
      if (typeof value === "function") {
        return value.bind(client);
      }
      return value;
    },
  });
})();
