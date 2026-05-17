// src/lib/ai.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = import.meta.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY tidak ditemukan di environment.");

const genAI = new GoogleGenerativeAI(apiKey);

export const mentorModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
    // Pindahkan schema ke sini, dan WAJIB gunakan SchemaType.*
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        reply: { 
          type: SchemaType.STRING, 
          description: "Balasan mengajar ramah menggunakan analogi kearifan lokal tanpa memberikan jawaban langsung." 
        },
        profileUpdate: {
          type: SchemaType.OBJECT,
          properties: {
            interest: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }, // Ini juga harus SchemaType
              description: "Daftar minat IT atau jaringan baru yang terdeteksi dari obrolan ini."
            },
            pace: { 
              type: SchemaType.STRING, 
              description: "Kecepatan pemahaman belajar siswa saat ini (lambat/normal/cepat)."
            },
            notes: { 
              type: SchemaType.STRING, 
              description: "Catatan singkat perkembangan atau kendala siswa." 
            }
          },
          required: ["interest", "pace", "notes"]
        }
      },
      required: ["reply", "profileUpdate"]
    }
  }
});