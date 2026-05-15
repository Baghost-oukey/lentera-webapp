import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: import.meta.env.DEV ? ['query', 'error', 'warn'] : ['error'],
});

if (!import.meta.env.PROD) globalForPrisma.prisma = db;