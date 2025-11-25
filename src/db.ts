import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma Client Singleton Pattern
 *
 * Why a singleton?
 * - Prevents "too many database connections" errors
 * - Reuses the same client instance across the app
 * - Properly handles connection pooling
 */

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma 7 with PostgreSQL
 * The DATABASE_URL comes from .env for local development
 * Railway automatically provides DATABASE_URL environment variable for production
 *
 * Prisma 7 requires an explicit adapter for PostgreSQL
 */
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = global.prisma || new PrismaClient({ adapter });

global.prisma = prisma;

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed when the app exits
 */
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
