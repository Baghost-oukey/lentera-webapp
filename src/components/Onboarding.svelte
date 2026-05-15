<script lang="ts">
  import { fade, slide } from 'svelte/transition';

  let step = $state(1);
  let name = $state('');
  let level = $state('');
  let loading = $state(false);

  async function handleSubmit() {
    if (!name || !level) return;
    loading = true;
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schoolLevel: level })
      });
      
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('lentera_user', JSON.stringify(user));
        window.location.href = '/belajar';
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="relative w-full max-w-md mx-auto">
  <!-- Progress Bar -->
  <div class="flex gap-2 mb-8 justify-center">
    <div class="h-1 w-12 rounded-full transition-all duration-500 {step >= 1 ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-slate-700'}"></div>
    <div class="h-1 w-12 rounded-full transition-all duration-500 {step >= 2 ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-slate-700'}"></div>
  </div>

  <div class="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/5 blur-[60px] rounded-full"></div>

    {#if step === 1}
      <div in:fade={{ duration: 400 }}>
        <h2 class="text-2xl font-bold text-white mb-2">Halo, Teman Belajar!</h2>
        <p class="text-slate-400 text-sm mb-6">Siapa nama panggilanmu? Biar LENTERA bisa menyapamu dengan akrab.</p>
        
        <input 
          type="text" 
          bind:value={name}
          placeholder="Contoh: Budi"
          class="w-full bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 transition-all mb-6"
        />

        <button 
          disabled={!name}
          onclick={() => step = 2}
          class="w-full bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
        >
          Lanjut
        </button>
      </div>
    {:else if step === 2}
      <div in:fade={{ duration: 400 }}>
        <button 
          onclick={() => step = 1}
          class="text-slate-500 text-xs mb-4 hover:text-teal-400 transition-colors flex items-center gap-1"
        >
          ← Kembali
        </button>
        <h2 class="text-2xl font-bold text-white mb-2">Kamu Sekolah di Mana?</h2>
        <p class="text-slate-400 text-sm mb-6">LENTERA akan menyesuaikan cara menjelaskan materi dengan level sekolahmu.</p>
        
        <div class="grid grid-cols-2 gap-4 mb-8">
          <button 
            onclick={() => level = 'SMP'}
            class="p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 {level === 'SMP' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-800/30 border-white/5 text-slate-500 hover:border-white/10'}"
          >
            <span class="text-2xl">🎒</span>
            <span class="font-bold">SMP</span>
          </button>
          <button 
            onclick={() => level = 'SMA'}
            class="p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 {level === 'SMA' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-800/30 border-white/5 text-slate-500 hover:border-white/10'}"
          >
            <span class="text-2xl">🎓</span>
            <span class="font-bold">SMA</span>
          </button>
        </div>

        <button 
          disabled={!level || loading}
          onclick={handleSubmit}
          class="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          {loading ? 'Menyiapkan Mentor...' : 'Mulai Sekarang'}
        </button>
      </div>
    {/if}
  </div>
</div>
