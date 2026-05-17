<script lang="ts">
  export let lessonId = "";
  export let title = "";
  export let schoolLevel = "SMP";
  export let htmlContent = ""; // HTML matang hasil render server Astro
</script>

<div class="max-w-3xl mx-auto p-8 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/40 relative overflow-hidden">
  
  <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C6F432]/30 to-transparent rounded-bl-full pointer-events-none"></div>

  <!-- Tombol Kembali ke Ruang Belajar (Dashboard) -->
  <div class="mb-6">
    <a 
      href="/belajar"
      class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#6320EE] transition-colors"
    >
      ← Kembali ke Ruang Belajar
    </a>
  </div>

  <div class="mb-6 pb-6 border-b border-slate-100">
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-indigo-50 text-[#6320EE] text-xs font-bold rounded-full uppercase tracking-wider">
        ⚡ Misi Jelajah IT
      </span>
      <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
        {schoolLevel}
      </span>
    </div>
    <h1 class="text-3xl font-black text-slate-800 mt-3 tracking-tight">
      {title}
    </h1>
  </div>

  <div class="custom-reader max-w-none">
    <style>
      .custom-reader h3 {
        color: #0f172a !important; /* slate-900 */
        font-size: 1.35rem;
        font-weight: 800;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-family: "Outfit", sans-serif;
      }
      .custom-reader blockquote {
        border-left: 4px solid #6320EE !important;
        background-color: #f8fafc !important;
        padding: 1.5rem !important;
        border-radius: 0 1.5rem 1.5rem 0 !important;
        color: #334155 !important; /* slate-700 */
        font-size: 1rem !important;
        line-height: 1.7 !important;
        margin: 1.5rem 0 !important;
        font-weight: 500 !important;
      }
      .custom-reader blockquote strong {
        color: #0f172a !important;
        font-weight: 700 !important;
      }
      .custom-reader p {
        color: #475569 !important; /* slate-600 */
        line-height: 1.75 !important;
        font-size: 1rem !important;
        margin-bottom: 1.25rem !important;
      }
      .custom-reader ul {
        margin-top: 1rem !important;
        margin-bottom: 1.5rem !important;
        list-style: none !important;
        padding-left: 0 !important;
      }
      .custom-reader ul li {
        position: relative !important;
        padding-left: 2.25rem !important;
        margin-bottom: 1rem !important;
        color: #334155 !important; /* slate-700 */
        line-height: 1.65 !important;
        font-size: 0.975rem !important;
        font-weight: 500 !important;
      }
      .custom-reader ul li::before {
        content: "✓" !important;
        position: absolute !important;
        left: 0 !important;
        top: 2px !important;
        width: 1.4rem !important;
        height: 1.4rem !important;
        background-color: #C6F432 !important;
        color: #0f172a !important;
        font-weight: 900 !important;
        font-size: 0.75rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 9999px !important;
        box-shadow: 0 3px 6px rgba(198, 244, 50, 0.4) !important;
      }
    </style>

    {@html htmlContent}
  </div>

  <div class="mt-12 p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="text-center sm:text-left">
      <h3 class="font-bold text-slate-800 text-base">Ada bagian materi yang bikin kamu bingung?</h3>
      <p class="text-xs text-slate-400 mt-0.5">Tenang, tanyakan langsung dan Mentor AI siap bedah pakai analogi seru!</p>
    </div>
    
    <a 
      href="/chat?topicId={lessonId}&launchMentor=true"
      class="w-full sm:w-auto text-center px-6 py-3.5 bg-[#6320EE] text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/10 hover:bg-opacity-95 transition-all duration-200 transform hover:-translate-y-0.5"
    >
      💬 Tantang Mentor AI
    </a>
  </div>

</div>
