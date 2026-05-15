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

<div class="flex flex-col h-[75vh] bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl relative">
  
  <div class="px-8 py-6 border-b border-slate-100 bg-white flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="relative">
        <div class="w-12 h-12 bg-[#6320EE] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-[#6320EE]/20">💡</div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#C6F432] border-4 border-white rounded-full"></div>
      </div>
      <div>
        <h3 class="text-slate-900 font-bold tracking-tight">Mentor LENTERA</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Now</p>
      </div>
    </div>
  </div>

  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-slate-50/30">
    {#each chat.messages as msg}
      <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}" in:fly={{ y: 10, duration: 400 }}>
        <div class="max-w-[80%] md:max-w-[70%] p-6 rounded-[2rem] {msg.role === 'user' ? 'bg-[#6320EE] text-white rounded-tr-none shadow-xl shadow-[#6320EE]/10' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}">
          <p class="leading-relaxed text-sm md:text-base font-medium">{msg.content}</p>
        </div>
      </div>
    {/each}

    {#if chat.isTyping}
      <div class="flex justify-start" in:fade>
        <div class="bg-white px-6 py-4 rounded-full border border-slate-100 flex gap-2 items-center shadow-sm">
          <div class="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-bounce"></div>
          <div class="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div class="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    {/if}
  </div>

  <div class="p-6 bg-white border-t border-slate-100">
    <div class="max-w-4xl mx-auto relative flex items-center gap-4">
      <input 
        type="text" 
        bind:value={chat.input}
        onkeydown={(e) => e.key === 'Enter' && chat.sendMessage()}
        placeholder="Tanyakan materi yang sulit..."
        class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-7 py-5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6320EE]/30 focus:ring-4 focus:ring-[#6320EE]/5 transition-all font-medium"
      />
      <button 
        onclick={chat.sendMessage}
        class="bg-[#C6F432] hover:bg-[#b3dd2d] p-5 rounded-2xl text-slate-950 transition-all shadow-lg shadow-[#C6F432]/20 active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</div>