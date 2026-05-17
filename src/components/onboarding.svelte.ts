import { navigate } from 'astro:transitions/client'; 

export function createOnboarding() {
  let step = $state(1);
  let name = $state('');
  let level = $state('');
  let topic = $state('');
  let errorMessage = $state('');
  let loading = $state(false);

  async function selectLevel(lvl: string) {
    level = lvl;
    loading = true;
    errorMessage = '';
    
    try {
      // 1. Ambil atau Buat User berbasis nama + jenjang sekolah
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schoolLevel: lvl })
      });
      
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('lentera_user_id', user.id);
        localStorage.setItem('lentera_user_name', user.name);

        // 2. Periksa apakah user ini sudah memiliki materi tersimpan di DB
        const profileRes = await fetch(`/api/profile?userId=${user.id}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.lessons && profile.lessons.length > 0) {
            // Siswa lama terdeteksi! Langsung arahkan ke Ruang Belajar mereka
            window.location.href = '/belajar';
            return;
          }
        }
      }
      
      // Jika siswa baru (belum ada materi), lanjut ke pemilihan topik pertama
      step = 3;
    } catch (e: any) {
      console.error("Onboarding Pre-check Error:", e);
      step = 3; // Jika gagal, tetap lanjut ke langkah 3 sebagai fallback
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!name || !level || !topic.trim()) return;
    loading = true;
    errorMessage = '';
    
    try {
      // 1. Registrasi Akun
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schoolLevel: level })
      });
      
      if (!res.ok) {
        throw new Error("Gagal mendaftarkan akun.");
      }
      
      const user = await res.json();
      localStorage.setItem('lentera_user_id', user.id);
      localStorage.setItem('lentera_user_name', user.name);

      // 2. Generate Modul Pelajaran Wikipedia Pertama
      const lessonRes = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          query: topic.trim(),
          schoolLevel: level
        })
      });

      const lessonData = await lessonRes.json();

      if (!lessonRes.ok) {
        throw new Error(lessonData.error || "Gagal menyiapkan materi pertama.");
      }

      // 3. Alihkan ke Dashboard — user akan melihat semua modul hasil scraping
      window.location.href = '/belajar';

    } catch (e: any) {
      console.error("Onboarding Error:", e);
      errorMessage = e.message || "Waduh, sepertinya koneksi kita sedang terganggu.";
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
    get topic() { return topic },
    set topic(v) { topic = v },
    get errorMessage() { return errorMessage },
    set errorMessage(v) { errorMessage = v },
    get loading() { return loading },
    selectLevel,
    handleSubmit
  };
}