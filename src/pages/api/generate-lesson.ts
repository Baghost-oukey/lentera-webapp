// src/pages/api/generate-lesson.ts
import type { APIRoute } from "astro";
import { WikiLessonService } from "../../service/wikiLessonService";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, query, schoolLevel } = body;

    // Validasi input ketat
    if (!userId || typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: "userId tidak valid." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!query || typeof query !== 'string' || query.trim().length === 0 || query.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: "Topik pencarian harus diisi dan maksimal 200 karakter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!['SMP', 'SMA'].includes(schoolLevel)) {
      return new Response(
        JSON.stringify({ error: "Jenjang sekolah tidak valid. Pilih SMP atau SMA." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Panggil service untuk proses scraping + caching database
    const newLesson = await WikiLessonService.generateLesson(userId, query, schoolLevel);

    // Kembalikan data materi yang berhasil dibuat/diambil dari cache
    return new Response(
      JSON.stringify({ success: true, lesson: newLesson }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("API Generate Lesson Error:", error);
    // Teruskan pesan user-friendly dari service (bukan stack trace internal)
    const userMessage = error.message?.startsWith('Topik')
      ? error.message
      : "Terjadi kesalahan pada server. Coba lagi sebentar.";
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
