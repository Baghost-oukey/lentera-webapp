// src/pages/api/register.ts
import type { APIRoute } from 'astro';
import { UserService } from '../../service/userService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, schoolLevel } = await request.json();

    if (!name || !schoolLevel) {
      return new Response(JSON.stringify({ error: "Data tidak lengkap" }), { status: 400 });
    }

    const user = await UserService.getOrCreateUser(name, schoolLevel);

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    // 🔴 TAMBAHKAN BARIS INI UNTUK MELIHAT ERROR ASLINYA DI TERMINAL VS CODE
    console.error("🔥 DETAIL ERROR DATABASE:", error); 
    
    return new Response(JSON.stringify({ error: "Gagal mendaftarkan user" }), { status: 500 });
  }
};