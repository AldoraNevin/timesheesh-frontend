# Setup Backend di WSL

Jika backend Go berjalan di WSL (Windows Subsystem for Linux) dan Next.js frontend berjalan di Windows, Anda perlu mengkonfigurasi IP address dengan benar.

## Masalah

Next.js API routes (yang berjalan di Windows) tidak bisa mengakses backend di WSL menggunakan `localhost:8000` atau `127.0.0.1:8000` karena mereka berjalan di environment yang berbeda.

## Solusi

### 1. Dapatkan WSL IP Address

Jalankan di WSL terminal:

```bash
hostname -I | awk '{print $1}'
```

Atau:

```bash
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
```

Contoh output: `172.20.10.2`

### 2. Buat File `.env.local`

Buat file `.env.local` di root project (sama level dengan `package.json`):

```env
# Untuk client-side (browser) - bisa tetap localhost
NEXT_PUBLIC_API_URL=http://localhost:8000

# Untuk server-side (Next.js API routes) - gunakan WSL IP
API_URL=http://172.20.10.2:8000
```

**Catatan:** Ganti `172.20.10.2` dengan IP address WSL Anda yang sebenarnya.

### 3. Pastikan Backend Bisa Diakses dari Windows

Di WSL, pastikan backend berjalan dan listen di `0.0.0.0:8000` (bukan hanya `127.0.0.1:8000`):

```go
// Di Go backend, pastikan listen di 0.0.0.0
router.Run("0.0.0.0:8000")
```

### 4. Test Koneksi

Dari Windows PowerShell, test apakah backend bisa diakses:

```powershell
# Ganti dengan WSL IP Anda
curl http://172.20.10.2:8000/health
```

Jika berhasil, Anda akan mendapat response dari backend.

### 5. Restart Next.js Dev Server

Setelah mengubah `.env.local`, restart Next.js dev server:

```bash
npm run dev
```

## Alternatif: Port Forwarding (WSL2)

Jika menggunakan WSL2, Anda bisa menggunakan port forwarding:

```bash
# Di Windows PowerShell (sebagai Administrator)
netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=172.20.10.2
```

Kemudian di `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000
```

## Troubleshooting

### Error: ECONNREFUSED

- Pastikan backend berjalan di WSL
- Pastikan backend listen di `0.0.0.0:8000` (bukan `127.0.0.1:8000`)
- Pastikan IP address di `.env.local` benar
- Test dengan `curl` dari Windows PowerShell

### Error: Connection Timeout

- Cek firewall Windows
- Pastikan port 8000 tidak diblokir
- Coba restart WSL: `wsl --shutdown` lalu buka lagi

### IP Address Berubah Setiap Restart WSL

WSL IP address bisa berubah setiap restart. Solusi:

1. **Gunakan static IP** (advanced)
2. **Update `.env.local` setiap kali IP berubah**
3. **Gunakan port forwarding** (lebih stabil)

## Catatan

- `NEXT_PUBLIC_API_URL` digunakan oleh client-side code (browser)
- `API_URL` digunakan oleh server-side code (Next.js API routes)
- Jangan commit `.env.local` ke git (sudah ada di `.gitignore`)

