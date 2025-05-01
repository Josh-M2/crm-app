import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaInstance = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "development")
  globalForPrisma.prisma = prismaInstance;

export default prismaInstance;
