import { db } from "../lib/db";

export class UserService {
  // 1. Create User: Sudah benar, saya tambahkan struktur default yang lebih lengkap
  static async createUser(name: string, schoolLevel: string) {
    return await db.user.create({
      data: {
        name,
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