// src/components/chat.svelte.ts
export function createChat() {
  let messages = $state([
    { role: 'mentor', content: 'Halo! Aku mentormu di LENTERA. Ada materi yang terasa sulit hari ini? Ceritakan saja, kita bedah bareng pakai analogi yang seru!' }
  ]);
  let input = $state('');
  let isTyping = $state(false);

  async function sendMessage() {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    input = '';
    messages = [...messages, { role: 'user', content: userMsg }];
    isTyping = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: localStorage.getItem('lentera_user_id'),
          message: userMsg 
        })
      });
      
      const data = await res.json();
      messages = [...messages, { role: 'mentor', content: data.content }];
    } catch (err) {
      console.error("Chat Error:", err);
      messages = [...messages, { role: 'mentor', content: 'Aduh, sepertinya ada gangguan sinyal di sini. Bisa diulang?' }];
    } finally {
      isTyping = false;
    }
  }

  return {
    get messages() { return messages },
    get input() { return input },
    set input(v) { input = v },
    get isTyping() { return isTyping },
    sendMessage
  };
}