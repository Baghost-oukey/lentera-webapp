// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { ChatService } from '../../service/chatService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId, message } = await request.json();

    if (
      !userId || typeof userId !== 'string' ||
      !message || typeof message !== 'string' || message.trim().length > 1000
    ) {
      return new Response(JSON.stringify({ error: "Input tidak valid." }), { status: 400 });
    }

    const reply = await ChatService.handleUserMessage(userId, message);

    return new Response(JSON.stringify(reply), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan. Coba lagi sebentar." }), { status: 500 });
  }
};