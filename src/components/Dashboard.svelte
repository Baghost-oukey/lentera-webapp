<!-- src/components/Dashboard.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Chat from './chat.svelte';

  // ─── State ────────────────────────────────────────────────────────────────
  let activeTab      = $state<'lessons' | 'chat'>('lessons');
  let searchQuery    = $state('');
  let newTopicQuery  = $state('');
  let loadingLessons = $state(true);
  let loadingSearch  = $state(false);
  let errorMsg       = $state('');
  let myLessons      = $state<any[]>([]);
  let userId         = $state('');
  let userName       = $state('');
  let schoolLevel    = $state('SMP');

  // Warna cover kartu — di-cycle agar setiap kartu tampak beda
  const gradients = [
    { from: 'from-violet-500/20', to: 'to-indigo-500/10', emoji: '🌐' },
    { from: 'from-sky-500/20',    to: 'to-cyan-500/10',   emoji: '💻' },
    { from: 'from-emerald-500/20',to: 'to-teal-500/10',   emoji: '📡' },
    { from: 'from-orange-500/20', to: 'to-amber-500/10',  emoji: '🔌' },
    { from: 'from-rose-500/20',   to: 'to-pink-500/10',   emoji: '🛡️' },
    { from: 'from-lime-500/20',   to: 'to-green-500/10',  emoji: '⚙️' },
  ];

  // Mapping difficulty string → angka (untuk dots)
  function difficultyDots(diff: string): number {
    const map: Record<string, number> = { Mudah: 1, Normal: 2, Susah: 3 };
    return map[diff] ?? 2;
  }

  // ─── Fetch user lessons dari DB ───────────────────────────────────────────
  async function fetchMyLessons() {
    userId    = localStorage.getItem('lentera_user_id') ?? '';
    userName  = localStorage.getItem('lentera_user_name') ?? '';
    if (!userId) { loadingLessons = false; return; }

    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const profile = await res.json();
        schoolLevel = profile.schoolLevel ?? 'SMP';
        myLessons   = profile.lessons ?? [];
      }
    } catch (e) {
      console.error('fetchMyLessons error:', e);
    } finally {
      loadingLessons = false;
    }
  }

  onMount(() => fetchMyLessons());

  // ─── Generate + scrape topik baru via Wikipedia ───────────────────────────
  async function handleSearch(e: Event) {
    e.preventDefault();
    if (!newTopicQuery.trim() || !userId) return;
    loadingSearch = true;
    errorMsg      = '';

    try {
      const res = await fetch('/api/generate-lesson', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          query:       newTopicQuery.trim(),
          schoolLevel
        })
      });
      const data = await res.json();
      if (!res.ok) {
        errorMsg = data.error ?? 'Topik tidak ditemukan. Coba kata kunci yang lebih spesifik!';
      } else {
        newTopicQuery = '';
        await fetchMyLessons();          // Refresh grid setelah scraping selesai
        window.location.href = `/belajar/modul/${data.lesson.id}`;
      }
    } catch (err) {
      errorMsg = 'Gagal terhubung ke server. Coba lagi sebentar ya!';
    } finally {
      loadingSearch = false;
    }
  }
</script>

<!-- ════════════════════════════════════════════════════════════════════════ -->
<div class="space-y-8">

  <!-- ── Tab switcher ──────────────────────────────────────────────────── -->
  <div class="flex border-b border-slate-200 gap-6 text-sm font-black uppercase tracking-wider">
    <button
      onclick={() => activeTab = 'lessons'}
      class="pb-4 px-1 border-b-4 transition-all {activeTab === 'lessons'
        ? 'border-[#6320EE] text-[#6320EE]'
        : 'border-transparent text-slate-400 hover:text-slate-600'}"
    >
      📚 Modul Belajar
    </button>
    <button
      onclick={() => activeTab = 'chat'}
      class="pb-4 px-1 border-b-4 transition-all {activeTab === 'chat'
        ? 'border-[#6320EE] text-[#6320EE]'
        : 'border-transparent text-slate-400 hover:text-slate-600'}"
    >
      💬 Tanya Mentor AI
    </button>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 'lessons'}
    <div in:fade class="space-y-10">

      <!-- ── Header: judul & nama user ─────────────────────────────── -->
      <div>
        <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
          Ruang Belajar · {schoolLevel}
        </p>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Halo, {userName || 'Pelajar'} 👋
        </h1>
        <p class="text-slate-500 text-sm mt-1 font-medium">
          Temukan dan pelajari topik IT apa saja — dirangkum langsung dari Wikipedia!
        </p>
      </div>

      <!-- ── Search bar: scrape topik baru ─────────────────────────── -->
      <form onsubmit={handleSearch} class="relative w-full max-w-4xl">
        <input
          type="text"
          bind:value={newTopicQuery}
          disabled={loadingSearch}
          placeholder="Ketik topik yang kamu mau pelajari… contoh: Internet, Server, HTML"
          class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 pr-16
                 text-slate-800 placeholder-slate-400 font-medium text-base shadow-sm
                 focus:outline-none focus:border-[#6320EE] focus:ring-4 focus:ring-[#6320EE]/5
                 disabled:opacity-60 transition-all"
        />
        <button
          type="submit"
          disabled={loadingSearch || !newTopicQuery.trim()}
          aria-label="Cari & Pelajari"
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-[#6320EE] text-white p-3 rounded-full
                 hover:bg-[#5219D9] disabled:opacity-40 transition-all shadow-md"
        >
          {#if loadingSearch}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          {/if}
        </button>
      </form>

      {#if errorMsg}
        <p in:fly={{ y: -8 }} class="text-sm text-red-500 font-semibold -mt-4">
          ⚠️ {errorMsg}
        </p>
      {/if}

      <!-- ── Grid hasil scraping dari DB ───────────────────────────── -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-extrabold text-slate-950 tracking-tight">
            Modul Kamu
            {#if !loadingLessons && myLessons.length > 0}
              <span class="ml-2 text-base font-bold text-slate-400">({myLessons.length})</span>
            {/if}
          </h2>
        </div>

        <!-- Loading skeleton -->
        {#if loadingLessons}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each Array(4) as _}
              <div class="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden animate-pulse">
                <div class="h-40 bg-slate-100"></div>
                <div class="p-5 space-y-3">
                  <div class="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div class="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              </div>
            {/each}
          </div>

        <!-- Grid kartu DB — layout persis Gambar 2 -->
        {:else if myLessons.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each myLessons as lesson, i}
              {@const g = gradients[i % gradients.length]}
              {@const dots = difficultyDots(lesson.difficulty)}
              <a
                href="/belajar/modul/{lesson.id}"
                class="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-md
                       hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                       flex flex-col group no-underline"
              >
                <!-- Cover visual (meniru thumbnail Gambar 2) -->
                <div class="h-44 w-full bg-gradient-to-br {g.from} {g.to}
                            relative flex items-center justify-center overflow-hidden border-b border-slate-50">
                  <!-- Grid dot pattern background -->
                  <div class="absolute inset-0 opacity-[0.07]
                              bg-[radial-gradient(#334155_1px,transparent_1px)]
                              bg-[size:14px_14px]"></div>
                  <!-- Badge level -->
                  <span class="absolute top-3 left-3 px-2.5 py-1 bg-white/70 backdrop-blur-sm
                               text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full
                               border border-white/50">
                    {lesson.schoolLevel}
                  </span>
                  <!-- Big emoji icon -->
                  <span class="text-5xl transform group-hover:scale-110 transition-transform duration-300 z-10 select-none">
                    {g.emoji}
                  </span>
                </div>

                <!-- Card body -->
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                      Wikipedia · {new Date(lesson.createdAt).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}
                    </p>
                    <h3 class="text-base font-black text-slate-800 leading-snug tracking-tight
                               group-hover:text-[#6320EE] transition-colors line-clamp-2 mb-1">
                      {lesson.lessonTitle}
                    </h3>
                    <p class="text-slate-400 text-[11px] font-semibold line-clamp-1">
                      Topik: "{lesson.userPrompt}"
                    </p>
                  </div>

                  <!-- Footer metadata — rating · durasi · difficulty (Gambar 2) -->
                  <div class="border-t border-slate-100 mt-4 pt-3.5
                              flex items-center justify-between
                              text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <!-- Rating bintang (dinamis berdasarkan urutan scraping) -->
                    <div class="flex items-center gap-1">
                      <span class="text-amber-400">★</span>
                      <span class="text-slate-600 font-extrabold">{(3.8 + (i % 3) * 0.3).toFixed(1)}</span>
                    </div>
                    <!-- Estimasi waktu baca -->
                    <div class="flex items-center gap-1">
                      <span>⏱</span>
                      <span>{5 + (i % 4) * 3} min</span>
                    </div>
                    <!-- Difficulty dots -->
                    <div class="flex items-center gap-1">
                      {#each Array(5) as _, di}
                        <span class="w-1.5 h-1.5 rounded-full
                          {di < dots ? 'bg-emerald-400' : 'bg-slate-200'}"></span>
                      {/each}
                    </div>
                  </div>
                </div>
              </a>
            {/each}
          </div>

        <!-- State kosong — belum ada modul -->
        {:else}
          <div class="bg-gradient-to-br from-slate-50 to-white border border-slate-100
                      rounded-[3rem] p-14 text-center flex flex-col items-center">
            <span class="text-5xl mb-4">📚</span>
            <h3 class="text-slate-800 font-black text-xl mb-2">Belum Ada Modul</h3>
            <p class="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
              Ketik topik IT apa saja di kolom pencarian di atas — LENTERA akan langsung
              men-scrape Wikipedia dan membuat beberapa modul terkait sekaligus untukmu!
            </p>
            <p class="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Contoh: Internet · HTML · Server · Jaringan · AI
            </p>
          </div>
        {/if}
      </div>

    </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  {:else if activeTab === 'chat'}
    <div in:fade>
      <Chat />
    </div>
  {/if}

</div>
