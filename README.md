# AING GPT - Backend Proxy Setup (Vercel)

Ringkasan: memindahkan panggilan API ke backend (serverless) sehingga API key tidak terlihat di sisi client. Endpoint serverless sudah ditambahkan di `api/chat.js`.

Langkah cepat untuk deploy di Vercel (GitHub):

- 1. Push repo ke GitHub dan hubungkan repository ke Vercel.
- 2. Di dashboard Vercel, buka project -> Settings -> Environment Variables.
- 3. Tambahkan variabel environment berikut (Production/Preview/Development sesuai kebutuhan):
  - `GENERATIVE_API_KEY` : API key Google Generative Language (contoh: `AIza...`) — wajib.
  - `GEMA_MODEL` : (opsional) model, default `gemma-4-31b-it`.

- 4. Commit dan push perubahan (sudah menghapus API key dari `index.html`). Vercel otomatis akan deploy dari branch yang terhubung.

Pengujian lokal (opsional):

1. Install Vercel CLI (jika ingin menjalankan serverless function lokal):

```powershell
npm i -g vercel
vercel login
vercel dev
```

2. Atau jalankan web server static sederhana dan gunakan `node` untuk memanggil API (ingat API key harus di-set di environment lokal saat testing). Contoh (PowerShell):

```powershell
$env:GENERATIVE_API_KEY="YOUR_KEY_HERE"
vercel dev
```

Catatan keamanan:

- Jangan menyimpan API key di file klien (seperti `index.html`).
- Pastikan `GENERATIVE_API_KEY` hanya diset di environment Vercel, bukan di kode sumber.

Jika Anda mau, saya bisa:

- Menambahkan validasi lebih ketat pada `api/chat.js`.
- Menambahkan rate-limit atau caching sederhana untuk mengurangi biaya.

## Environment variables (Vercel)

This project expects several environment variables to be set in the Vercel Project Settings (Environment Variables). Create them in the dashboard and provide real secret values there — do NOT commit secret values to the repository.

Recommended variables (create these names in Vercel):

- `GEMA_API_KEYS` — your generative API key(s)
- `GEMA_MODEL` — optional default model (e.g. `gema-2.5-flash`)
- `USER1_USER`, `USER1_PASS`, `USER2_USER`, `USER2_PASS`, etc. — demo user credentials shown in the screenshot

You can use the provided `.env.example` file as a reference when creating the variables in Vercel.

---

## Login demo (untuk deploy statis)

- Telah ditambahkan halaman login sederhana (`login.html`) dan skrip autentikasi client-side (`js/auth.js`).
- Demo akun: `admin / admin123` dan `user / user123`.
- `index.html` akan mengarahkan ke `/login.html` jika tidak ada sesi.
- Pendekatan ini hanya untuk demo atau pengujian di Vercel (static). Jangan gunakan untuk produksi — gunakan autentikasi server-side.
