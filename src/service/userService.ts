import { db } from "../lib/db";

export class UserService {
  // 1. Get or Create User — frictionless login berbasis nama
  static async getOrCreateUser(name: string, schoolLevel: string) {
    const trimmedName = name.trim();

    // Cari user yang sudah terdaftar (case-insensitive)
    const existing = await db.user.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        schoolLevel
      }
    });

    if (existing) return existing;

    return await db.user.create({
      data: {
        name: trimmedName,
        schoolLevel,
        aiProfile: {
          interest: [],
          pace: "normal",
          notes: "Belum ada catatan. Mulailah mengobrol dengan Mentor!",
          lastSession: new Date().toISOString()
        }
      }
    });
  }

  // 2. Get By ID: Sangat standar, bagus.
  static async getById(id: string) {
    return await db.user.findUnique({ 
      where: { id },
      // Kita include count messages agar bisa menampilkan "Total Pesan" di dashboard
      include: {
        lessons: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  // 3. Update Profile: Berguna jika kedepannya ada fitur "Reset Profil AI"
  static async updateAiProfile(id: string, newProfile: object) {
    return await db.user.update({
      where: { id },
      data: { aiProfile: newProfile }
    });
  }
}