<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { createChat } from './chat.svelte.ts';

  const chat = createChat();
  let chatContainer: HTMLElement;

  // Auto-scroll ke bawah saat ada pesan baru
  $effect(() => {
    if (chat.messages && chatContainer) {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
  });
</script>

<div class="flex flex-col h-[75vh] bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
  
  <div class="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="relative">
        <div class="w-12 h-12 bg-[#6320EE] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-[#6320EE]/20">💡</div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#C6F432] border-4 border-[#0F172A] rounded-full"></div>
      </div>
      <div>
        <h3 class="text-white font-bold tracking-tight">Mentor LENTERA</h3>
        <p class="text-xs text-slate-500 font-medium uppercase tracking-widest">Ready to help</p>
      </div>
    </div>
  </div>

  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
    {#each chat.messages as msg}
      <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}" in:fly={{ y: 10, duration: 400 }}>
        <div class="max-w-[80%] md:max-w-[70%] p-6 rounded-[2rem] {msg.role === 'user' ? 'bg-[#6320EE] text-white rounded-tr-none shadow-xl shadow-[#6320EE]/10' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'}">
          <p class="leading-relaxed text-sm md:text-base">{msg.content}</p>
        </div>
      </div>
    {/each}

    {#if chat.isTyping}
      <div class="flex justify-start" in:fade>
        <div class="bg-slate-800/50 px-6 py-4 rounded-full border border-white/5 flex gap-2 items-center">
          <div class="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-bounce"></div>
          <div class="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div class="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    {/if}
  </div>

  <div class="p-6 bg-slate-900/80 border-t border-white/5">
    <div class="max-w-4xl mx-auto relative flex items-center gap-4">
      <input 
        type="text" 
        bind:value={chat.input}
        onkeydown={(e) => e.key === 'Enter' && chat.sendMessage()}
        placeholder="Tanyakan materi yang sulit..."
        class="flex-1 bg-slate-800/40 border border-white/10 rounded-2xl px-7 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#6320EE]/50 focus:ring-4 focus:ring-[#6320EE]/5 transition-all"
      />
      <button 
        onclick={chat.sendMessage}
        class="bg-[#C6F432] hover:bg-[#b3dd2d] p-5 rounded-2xl text-slate-950 transition-all shadow-lg shadow-[#C6F432]/10 active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</div>