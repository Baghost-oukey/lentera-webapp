import type { APIRoute } from 'astro';
import { UserService } from '../../service/userService';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID tidak ditemukan" }), { status: 400 });
    }

    const profile = await UserService.getById(userId);

    if (!profile) {
      return new Response(JSON.stringify({ error: "User tidak ditemukan" }), { status: 404 });
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};