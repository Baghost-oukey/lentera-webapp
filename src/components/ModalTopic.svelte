<!-- src/components/ModalTopic.svelte -->
<script lang="ts">
  interface Props {
    userId?: string;
    selectedLevel?: string;
    onClose?: () => void;
  }
  let { userId = '', selectedLevel = 'SMP', onClose = () => {} }: Props = $props();

  let topicQuery = $state('');
  let isLoading  = $state(false);
  let errorMsg   = $state('');

  async function handleSubmit() {
    if (!topicQuery.trim()) {
      errorMsg = 'Ketik dulu topik yang mau kamu kepoin ya!';
      return;
    }
    isLoading = true;
    errorMsg  = '';

    try {
      const res = await fetch('/api/generate-lesson', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          query:       topicQuery.trim(),
          schoolLevel: selectedLevel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg = data.error ?? 'Topik tidak ditemukan. Coba kata kunci yang lebih spesifik!';
        return;
      }

      // Berhasil — arahkan ke modul baca dan tutup modal
      window.location.href = `/belajar/modul/${data.lesson.id}`;
    } catch {
      errorMsg = 'Gagal terhubung ke server. Coba lagi ya!';
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading) handleSubmit();
    if (e.key === 'Escape') onClose();
  }
</script>

<!-- Overlay -->
<div
  class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  role="dialog"
  aria-modal="true"
  aria-label="Modal Topik Baru"
>
  <div class="bg-white p-8 rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl relative overflow-hidden">

    <!-- Badge level -->
    <div class="flex items-center gap-2 mb-4">
      <span class="px-3 py-1 bg-indigo-50 text-[#6320EE] text-xs font-bold rounded-full">
        Target: Tingkat {selectedLevel}
      </span>
    </div>

    <h2 class="text-2xl font-black text-slate-800 tracking-tight">
      Mau Belajar Apa Hari Ini?
    </h2>
    <p class="text-sm text-slate-500 mt-2 leading-relaxed">
      Ketik topik IT yang bikin kamu penasaran — LENTERA langsung merangkum dari Wikipedia!
    </p>

    <div class="mt-6 relative">
      <input
        type="text"
        bind:value={topicQuery}
        onkeydown={handleKeydown}
        disabled={isLoading}
        placeholder="Contoh: Internet, server, HTML, coding..."
        class="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl
               placeholder-slate-400 focus:outline-none focus:border-[#6320EE] focus:bg-white
               transition-all duration-200 disabled:opacity-60"
      />

      {#if errorMsg}
        <p class="text-xs text-red-500 mt-2 ml-1 font-medium">⚠️ {errorMsg}</p>
      {/if}
    </div>

    <div class="mt-8 flex flex-col gap-3">
      <button
        onclick={handleSubmit}
        disabled={isLoading || !topicQuery.trim()}
        class="w-full py-4 bg-[#C6F432] text-slate-900 font-bold rounded-2xl shadow-lg
               shadow-lime-500/20 hover:bg-opacity-95 transition-all duration-200
               flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {#if isLoading}
          <div class="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          Memindai Basis Data...
        {:else}
          🚀 Mulai Petualangan
        {/if}
      </button>

      <button
        onclick={onClose}
        disabled={isLoading}
        class="w-full py-3 bg-transparent text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
      >
        ← Kembali
      </button>
    </div>

  </div>
</div>