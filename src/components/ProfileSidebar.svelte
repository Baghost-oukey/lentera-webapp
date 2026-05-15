<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let user = $state<any>(null);
  let loading = $state(true);

  async function fetchProfile() {
    const userId = localStorage.getItem('lentera_user_id');
    if (!userId) {
      window.location.href = '/';
      return;
    }

    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        user = await res.json();
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchProfile();
    // Refresh profile occasionally or on specific events if needed
  });
</script>

<aside class="space-y-6">
  {#if loading}
    <div class="bg-slate-900/60 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl animate-pulse">
      <div class="w-16 h-16 bg-slate-800 rounded-2xl mb-6"></div>
      <div class="h-6 bg-slate-800 rounded w-3/4 mb-4"></div>
      <div class="h-4 bg-slate-800 rounded w-1/2"></div>
    </div>
  {:else if user}
    <div in:fade class="bg-slate-900/60 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
      <div class="w-16 h-16 bg-gradient-to-tr from-[#6320EE] to-[#C6F432] rounded-2xl mb-6 flex items-center justify-center text-2xl font-black text-slate-900 shadow-lg shadow-[#6320EE]/20">
        {user.name[0]}
      </div>
      <h2 class="text-white text-2xl font-black tracking-tight">
        {user.name}
      </h2>
      <p class="text-[#C6F432] text-xs font-bold uppercase tracking-[0.2em] mt-1">
        {user.schoolLevel} Student
      </p>

      <div class="mt-8 pt-8 border-t border-white/5 space-y-6">
        <div>
          <p class="text-slate-500 text-[10px] font-black uppercase mb-3 tracking-widest">
            Minat Terdeteksi
          </p>
          <div class="flex flex-wrap gap-2">
            {#if user.aiProfile?.interest?.length > 0}
              {#each user.aiProfile.interest as item}
                <span class="px-3 py-1 bg-[#6320EE]/10 border border-[#6320EE]/20 text-[#6320EE] text-[10px] font-bold rounded-full uppercase">
                  {item}
                </span>
              {/each}
            {:else}
              <span class="text-slate-600 text-[10px] italic">Belum ada minat terdeteksi</span>
            {/if}
          </div>
        </div>

        <div>
          <p class="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest">
            Kecepatan Belajar
          </p>
          <p class="text-white text-sm font-bold capitalize">
            {user.aiProfile?.pace || 'Normal'}
          </p>
        </div>
      </div>
    </div>

    <div in:fade class="bg-gradient-to-br from-[#6320EE]/20 to-transparent border border-[#6320EE]/20 p-8 rounded-[2.5rem] backdrop-blur-xl">
      <p class="text-white/50 text-[10px] font-black uppercase mb-3 tracking-widest">
        Catatan Mentor
      </p>
      <p class="text-slate-300 text-sm leading-relaxed italic">
        "{user.aiProfile?.notes || 'Mulai ngobrol yuk, biar aku bisa kenal cara belajarmu!'}"
      </p>
    </div>
  {/if}
</aside>
