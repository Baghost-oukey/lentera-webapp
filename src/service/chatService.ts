// src/service/chatService.ts
import { db } from "../lib/db";
import { mentorModel } from "../lib/ai";
import type { Message } from "../generated/prisma";

interface AIResponse {
  reply: string;
  profileUpdate: {
    interest: string[];
    pace: string;
    notes: string;
  };
}

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

    // 🔴 PENCEGAHAN SPAM (Rate Limit / Cooldown):
    // Batasi minimal 3 detik antara pengiriman pesan per user untuk mencegah spam database dan API
    const lastMessage = user.messages[0];
    if (lastMessage) {
      const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
      if (timeDiff < 3000) {
        return {
          id: `cooldown-${Date.now()}`,
          role: "mentor",
          content: "Eits, belajarnya pelan-pelan ya! Tunggu sekitar 3 detik sebelum mengirim pesan berikutnya agar kita bisa fokus berdiskusi.",
          userId,
          createdAt: new Date()
        };
      }
    }

    const history = user.messages
      .reverse()
      .map((m: Message) => `${m.role === 'user' ? 'Siswa' : 'Mentor'}: ${m.content}`)
      .join("\n");

    const prompt = `
      Kamu adalah Mentor LENTERA, pendamping belajar cerdas berbasis AI untuk anak sekolah tingkat ${user.schoolLevel}.
      
      Profil Psikologis & Minat Saat Ini: 
      ${JSON.stringify(user.aiProfile)}
      
      History Percakapan:
      ${history}

      Pertanyaan Siswa Terbaru: "${content}"

      Tugas Utama:
      1. Beri balasan ramah dengan analogi kearifan lokal (seperti pos ronda, sistem irigasi sawah, atau transaksi pasar desa) yang dekat dengan kehidupan mereka.
      2. Pancing logika siswa menggunakan metode bertahap (sokratik), dilarang memberikan jawaban langsung secara instan.
      3. Analisis apakah ada minat bidang IT atau jaringan baru yang muncul dari pertanyaan terbaru siswa ini.
    `;

    let aiData: AIResponse;
    
    try {
      // 🔴 SANGAT CLEAN: Cukup panggil model dan berikan array format yang valid
      const result = await mentorModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      
      aiData = JSON.parse(result.response.text());
    } catch (error: any) {
      console.error("AI Error Detail:", error);
      
      let fallbackReply = "Wah, mentor sedang merenung sejenak. Bisa ceritakan lagi pelan-pelan?";
      
      // Jika terdeteksi Too Many Requests (Rate Limit 429) dari API Key Gemini gratis
      if (error?.status === 429) {
        fallbackReply = "Aduh, sepertinya kelas kita sedang sangat ramai! Siswa lain juga sedang berdiskusi dengan mentor. Tunggu sekitar 1 menit, lalu coba kirim pesanmu lagi ya!";
      } else if (error?.status === 404) {
        fallbackReply = "Wah, sepertinya mentor sedang memutakhirkan modul belajar baru. Coba sesaat lagi ya!";
      }

      aiData = {
        reply: fallbackReply,
        profileUpdate: { 
          interest: [], 
          pace: "normal", 
          notes: `API Error (Status: ${error?.status || 'Unknown'})` 
        }
      };
    }

    return await db.$transaction(async (tx) => {
      await tx.message.create({
        data: { content, role: 'user', userId }
      });

      const mentorReply = await tx.message.create({
        data: { content: aiData.reply, role: 'mentor', userId }
      });

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
            interest: newInterests
          } 
        }
      });

      return mentorReply;
    });
  }
}