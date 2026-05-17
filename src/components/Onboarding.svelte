<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createOnboarding } from './onboarding.svelte.ts';

  // Inisialisasi controller
  const chat = createOnboarding();
</script>

<div class="relative w-full max-w-md mx-auto">
  <!-- Step Indicators (3 Steps) -->
  <div class="flex gap-2 mb-8 justify-center">
    <div class="h-1 w-12 rounded-full transition-all duration-500 {chat.step >= 1 ? 'bg-[#6320EE]' : 'bg-slate-200'}"></div>
    <div class="h-1 w-12 rounded-full transition-all duration-500 {chat.step >= 2 ? 'bg-[#6320EE]' : 'bg-slate-200'}"></div>
    <div class="h-1 w-12 rounded-full transition-all duration-500 {chat.step >= 3 ? 'bg-[#6320EE]' : 'bg-slate-200'}"></div>
  </div>

  <div class="bg-white border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden shadow-xl">
    {#if chat.step === 1}
      <div in:fade>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Halo, Teman Belajar!</h2>
        <p class="text-slate-500 text-sm mb-6 font-medium">Beri tahu Mentor nama panggilanmu terlebih dahulu ya.</p>
        <input 
          type="text" 
          bind:value={chat.name}
          placeholder="Contoh: Budi"
          class="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-6 py-4 text-slate-700 transition-all mb-6 placeholder-slate-400 focus:outline-none"
        />
        <button 
          disabled={!chat.name}
          onclick={() => chat.step = 2}
          class="w-full bg-[#6320EE] hover:bg-[#5219D9] disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-[#6320EE]/20 active:scale-[0.98]"
        >
          Lanjut
        </button>
      </div>
    {:else if chat.step === 2}
      <div in:fade>
        <button 
          onclick={() => chat.step = 1}
          class="text-slate-400 text-xs mb-4 hover:text-[#6320EE] transition-colors flex items-center gap-1 uppercase font-bold tracking-widest"
        >
          ← Kembali
        </button>
        
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Kamu Sekolah di Mana?</h2>
        <p class="text-slate-500 text-sm mb-8 font-medium">LENTERA akan menyesuaikan cara menjelaskan materi dengan level sekolahmu.</p>
        
        <div class="grid grid-cols-2 gap-4 mb-8">
          <button 
            onclick={() => chat.level = 'SMP'}
            class="p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 {chat.level === 'SMP' ? 'bg-[#6320EE]/10 border-[#6320EE] text-[#6320EE]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'}"
          >
            <span class="text-3xl">🎒</span>
            <span class="font-bold">SMP</span>
          </button>
          <button 
            onclick={() => chat.level = 'SMA'}
            class="p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 {chat.level === 'SMA' ? 'bg-[#6320EE]/10 border-[#6320EE] text-[#6320EE]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'}"
          >
            <span class="text-3xl">🎓</span>
            <span class="font-bold">SMA</span>
          </button>
        </div>

        <button 
          disabled={!chat.level || chat.loading}
          onclick={() => chat.selectLevel(chat.level)}
          class="w-full bg-[#6320EE] hover:bg-[#5219D9] disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-[#6320EE]/20 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {#if chat.loading}
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Memeriksa Akun...
          {:else}
            Lanjut
          {/if}
        </button>
      </div>
    {:else if chat.step === 3}
      <div in:fade>
        <button 
          onclick={() => chat.step = 2}
          class="text-slate-400 text-xs mb-4 hover:text-[#6320EE] transition-colors flex items-center gap-1 uppercase font-bold tracking-widest"
        >
          ← Kembali
        </button>
        
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Mau Belajar Apa Hari Ini?</h2>
        <p class="text-slate-500 text-sm mb-6 font-medium">Ketik topik IT atau jaringan komputer yang bikin kamu penasaran. LENTERA akan merangkumnya secara instan!</p>
        
        <input 
          type="text" 
          bind:value={chat.topic}
          disabled={chat.loading}
          placeholder="Contoh: Cara kerja internet, coding, server..."
          class="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-6 py-4 text-slate-700 transition-all mb-4 placeholder-slate-400 focus:outline-none disabled:bg-slate-50"
        />

        {#if chat.errorMessage}
          <p class="text-xs text-red-500 mb-4 font-medium">⚠️ {chat.errorMessage}</p>
        {/if}

        <button 
          disabled={!chat.topic || chat.loading}
          onclick={chat.handleSubmit}
          class="w-full bg-[#C6F432] hover:bg-[#b3dd2d] disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black py-5 rounded-2xl transition-all shadow-xl shadow-lime-500/20 active:scale-[0.98] text-lg flex items-center justify-center gap-2"
        >
          {#if chat.loading}
            <div class="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            Memindai Basis Data...
          {:else}
            🚀 Mulai Belajar Sekarang
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>