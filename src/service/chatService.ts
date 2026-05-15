// src/service/chatService.ts
import { db } from "../lib/db";
import { mentorModel } from "../lib/ai";
import type { Message } from "../generated/prisma";

export class ChatService {
  static async handleUserMessage(userId: string, content: string) {
    // 1. Ambil data User & History (Context Awareness)
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { 
        messages: { 
          take: 6, 
          orderBy: { createdAt: 'desc' } 
        } 
      }
    });

    if (!user) throw new Error("User tidak ditemukan");

    // 2. Susun prompt dengan teknik Invisible Profiling
    const history = user.messages
      .reverse()
      .map((m: Message) => `${m.role === 'user' ? 'Siswa' : 'Mentor'}: ${m.content}`)
      .join("\n");

    const prompt = `
      Kamu adalah LENTERA Mentor untuk anak ${user.schoolLevel}.
      Profil Psikologis/Belajar saat ini: ${JSON.stringify(user.aiProfile)}.
      
      History Percakapan:
      ${history}

      Pesan terbaru dari anak: "${content}"

      Tugasmu:
      1. Balas dengan ramah, santai, dan gunakan analogi desa. 
      2. Jangan beri jawaban langsung, pancing dengan pertanyaan logika.
      3. Analisis apakah ada minat baru atau perubahan gaya belajar dari pesan ini.

      Output harus format JSON:
      {
        "reply": "isi balasanmu",
        "profileUpdate": { "interest": ["list minat baru"], "pace": "slow/normal/fast", "notes": "catatan perkembangan" }
      }
    `;

    // 3. Panggil AI dengan penanganan error parsing
    interface AIResponse {
      reply: string;
      profileUpdate: {
        interest: string[];
        pace: string;
        notes: string;
      };
    }

    let aiData: AIResponse;
    try {
      const result = await mentorModel.generateContent(prompt);
      const responseText = result.response.text();
      aiData = JSON.parse(responseText);
    } catch (error) {
      console.error("AI Response Parsing Error:", error);
      throw new Error("Gagal mendapatkan respon cerdas dari mentor. Silakan coba lagi.");
    }

    // 4. Simpan ke Database (Atomic Transaction)
    // Keuntungan: Jika simpan pesan gagal, profil tidak akan terupdate (konsisten)
    return await db.$transaction(async (tx) => {
      // Simpan pesan user
      await tx.message.create({
        data: { content, role: 'user', userId }
      });

      // Simpan balasan mentor
      const mentorReply = await tx.message.create({
        data: { content: aiData.reply, role: 'mentor', userId }
      });

      // Update profil secara invisible (merge data lama dengan update terbaru)
      await tx.user.update({
        where: { id: userId },
        data: { 
          aiProfile: { 
            ...(user.aiProfile as object), 
            ...aiData.profileUpdate 
          } 
        }
      });

      return mentorReply;
    });
  }
}