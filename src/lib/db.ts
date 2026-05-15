import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  // Ambil URL menggunakan standar Astro (import.meta.env)
  const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("🚨 GAWAT: URL Database tidak terbaca oleh Astro!");
  }

  // Masukkan URL ke dalam connection pool
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;