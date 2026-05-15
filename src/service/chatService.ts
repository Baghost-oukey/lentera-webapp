// src/service/chatService.ts
import { db } from "../lib/db";
import { mentorModel } from "../lib/ai";
import type { Message } from "../generated/prisma";

export class ChatService {
  static async handleUserMessage(userId: string, content: string) {
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

    const history = user.messages
      .reverse()
      .map((m: Message) => `${m.role === 'user' ? 'Siswa' : 'Mentor'}: ${m.content}`)
      .join("\n");

    // 1. Prompt dikoreksi agar AI memberikan JSON murni tanpa markdown
    const prompt = `
      Kamu adalah Mentor LENTERA untuk anak ${user.schoolLevel}.
      Profil Psikologis saat ini: ${JSON.stringify(user.aiProfile)}.
      
      History Percakapan:
      ${history}

      Pertanyaan Siswa: "${content}"

      Tugas:
      1. Beri balasan ramah dengan analogi kearifan lokal (desa/pasar/sawah).
      2. Pancing logika siswa, jangan beri jawaban langsung.
      3. Analisis minat baru dari percakapan ini.

      PENTING: Balas HANYA dengan format JSON murni berikut:
      {
        "reply": "Isi balasanmu",
        "profileUpdate": { "interest": [], "pace": "normal", "notes": "" }
      }
    `;

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
      let responseText = result.response.text();
      
      // 2. Sanitasi Response: Menghapus block markdown ```json jika AI membandel
      responseText = responseText.replace(/```json|```/g, "").trim();
      
      aiData = JSON.parse(responseText);
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback jika AI gagal memberikan JSON yang valid
      aiData = {
        reply: "Wah, mentor sedang merenung sejenak. Bisa ceritakan lagi pelan-pelan?",
        profileUpdate: { interest: [], pace: "normal", notes: "JSON parsing failed" }
      };
    }

    return await db.$transaction(async (tx) => {
      await tx.message.create({
        data: { content, role: 'user', userId }
      });

      const mentorReply = await tx.message.create({
        data: { content: aiData.reply, role: 'mentor', userId }
      });

      // 3. Update profil: Pastikan minat bersifat akumulatif (tidak tertimpa)
      const currentProfile = (user.aiProfile as any) || { interest: [] };
      const newInterests = Array.from(new Set([
        ...(currentProfile.interest || []),
        ...(aiData.profileUpdate.interest || [])
      ]));

      await tx.user.update({
        where: { id: userId },
        data: { 
          aiProfile: { 
            ...currentProfile, 
            ...aiData.profileUpdate,
            interest: newInterests // Minat digabung, bukan diganti
          } 
        }
      });

      return mentorReply;
    });
  }
}