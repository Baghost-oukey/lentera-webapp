import { navigate } from 'astro:transitions/client'; 

export function createOnboarding() {
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
        localStorage.setItem('lentera_user_id', user.id);
        localStorage.setItem('lentera_user_name', user.name);
        window.location.href = '/belajar';
      }
    } catch (e) {
      console.error("Registration Error:", e);
    } finally {
      loading = false;
    }
  }

  return {
    // Getters & Setters
    get step() { return step },
    set step(v) { step = v },
    get name() { return name },
    set name(v) { name = v },
    get level() { return level },
    set level(v) { level = v },
    get loading() { return loading },
    handleSubmit
  };
}