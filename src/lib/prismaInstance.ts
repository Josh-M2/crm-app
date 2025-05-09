import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const myExtension = Prisma.defineExtension({
  name: "logger", // Optional: name appears in error logs
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (process.env.NODE_ENV === "development") {
          console.log(`[PRISMA] ${model}.${operation}`);
        }
        return query(args);
      },
    },
  },
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaInstance =
  globalForPrisma.prisma || new PrismaClient().$extends(myExtension);

if (process.env.NODE_ENV !== "development")
  globalForPrisma.prisma = prismaInstance;

export default prismaInstance;
