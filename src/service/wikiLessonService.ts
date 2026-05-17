// src/service/wikiLessonService.ts
import { split } from "sentence-splitter";
import { db } from "../lib/db";

function cleanIndonesianQuery(query: string): string {
  let cleaned = query.trim();

  // List frase percakapan yang sering dipakai anak sekolah tingkat SMP/SMA:
  const conversationalPhrases = [
    /^(aku|saya|kami|kita)\s+(mau|ingin|pengen|pengin)\s+(belajar|tau|tahu|kepoin)\s+(tentang|soal|seputar)?/i,
    /^(aku|saya|kami|kita)\s+(mau|ingin|pengen|pengin)\s+(belajar|tau|tahu|kepoin)/i,
    /^(belajar|cari\s+tahu|kepoin)\s+(tentang|soal|seputar)/i,
    /^(belajar|kepoin|soal|tentang|seputar)\s+/i,
    /^(apa\s+itu|apakah\s+itu|apa\s+sih|jelaskan\s+tentang|jelaskan|maksud\s+dari|maksud)\s+/i,
    /^(bagaimana\s+)?cara\s+kerja\s+/i,
    /^(bagaimana|bagaimanakah)\s+/i,
    /^(sejarah|pengertian|definisi|arti\s+dari)\s+/i,
  ];

  for (const regex of conversationalPhrases) {
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, "");
      break; // stop di pencocokan pertama yang paling spesifik
    }
  }

  return cleaned.trim() || query.trim();
}

export class WikiLessonService {
  static async generateLesson(userId: string, query: string, schoolLevel: string) {
    const originalQuery = query.trim();
    if (!originalQuery) throw new Error("Topik pencarian tidak boleh kosong");

    // 1. Bersihkan query dari kalimat percakapan bahasa Indonesia
    const sanitizedQuery = cleanIndonesianQuery(originalQuery);

    // 2. Caching Check untuk Topik Utama bagi USER ini:
    // Jika user ini sudah pernah membuat/men-scrape topik utama ini, langsung kembalikan.
    const existingLesson = await db.generatedLesson.findFirst({
      where: {
        userId,
        schoolLevel,
        userPrompt: { contains: sanitizedQuery, mode: 'insensitive' }
      }
    });

    if (existingLesson) return existingLesson;

    try {
      // 3. Cari judul artikel terdekat & terkait di Wikipedia menggunakan Opensearch API (limit=4)
      const searchUrl = `https://id.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(sanitizedQuery)}&limit=4&namespace=0&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (!searchData[1] || searchData[1].length === 0) {
        throw new Error(`Topik "${originalQuery}" belum tersedia. Yuk, coba ketik topik IT yang seru seperti: Internet, Server, Coding, Jaringan Komputer, atau Kecerdasan Buatan!`);
      }

      const foundTitles = searchData[1] as string[];
      let primaryLesson: any = null;

      // 4. Loop untuk men-scrape semua artikel yang ditemukan (hingga 4 modul terkait!)
      for (let i = 0; i < foundTitles.length; i++) {
        const pageTitle = foundTitles[i];

        // Cek apakah modul dengan judul & level ini sudah pernah di-scrape oleh user ini
        const alreadyExists = await db.generatedLesson.findFirst({
          where: {
            userId,
            sourceTitle: pageTitle,
            schoolLevel
          }
        });

        if (alreadyExists) {
          if (i === 0) primaryLesson = alreadyExists;
          continue;
        }

        // Ambil ringkasan pendek resmi dari Wikipedia REST API Summary untuk artikel ini
        const summaryUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryRes = await fetch(summaryUrl);
        
        if (!summaryRes.ok) continue;

        const summaryData = await summaryRes.json();
        const sentences = split(summaryData.extract || "")
          .filter(node => node.type === "Sentence")
          .map(node => node.raw.trim());

        if (sentences.length === 0) continue;

        const formattedMarkdown = `
### 💡 Kenalan Singkat
> **${summaryData.description || 'Edukasi Teknologi'}**: ${sentences[0]}

### 📌 Poin Penting yang Harus Kamu Tahu
${sentences.slice(1).map(s => `* ${s}`).join("\n")}
        `.trim();

        // Tentukan kata kunci pemicu yang bersih untuk userPrompt
        const triggerPrompt = i === 0 ? sanitizedQuery : pageTitle.toLowerCase();

        // Simpan modul ke database untuk USER ini
        const createdLesson = await db.generatedLesson.create({
          data: {
            userId,
            userPrompt: triggerPrompt,
            sourceTitle: pageTitle,
            lessonTitle: `Edukasi Seru Seputar ${pageTitle}`,
            cleanContent: formattedMarkdown,
            schoolLevel,
            difficulty: "Normal"
          }
        });

        if (i === 0) {
          primaryLesson = createdLesson;
        }
      }

      // Jika modul utama berhasil dibuat/diambil, kembalikan. Jika tidak ada sama sekali, lempar error.
      if (primaryLesson) {
        return primaryLesson;
      }

      // Jika karena suatu hal modul utama gagal tapi ada modul terkait yang berhasil dibuat, ambil yang pertama
      const fallbackLesson = await db.generatedLesson.findFirst({
        where: { userId, schoolLevel },
        orderBy: { createdAt: 'desc' }
      });

      if (fallbackLesson) return fallbackLesson;

      throw new Error(`Topik "${originalQuery}" belum tersedia. Yuk, coba ketik topik IT yang seru seperti: Internet, Server, Coding, Jaringan Komputer, atau Kecerdasan Buatan!`);

    } catch (error) {
      console.error("Wiki Lesson Service Error:", error);
      throw error;
    }
  }
}
