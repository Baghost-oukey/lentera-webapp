// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  // 🔴 INI KUNCI JAWABANNYA: Ubah Astro ke mode Server-Side Rendering
  output: 'server', 
  adapter: node({
    mode: 'standalone'
  }),
  
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['@prisma/client', 'pg', '@prisma/adapter-pg']
    },
    optimizeDeps: {
      exclude: ['@prisma/client', 'pg', '@prisma/adapter-pg']
    }
  }
});