# Implementation Plan & Execution Roadmap
## Proyek: E-Commerce MVP (Next.js + Elysia.js + Bun + PostgreSQL + Prisma)

| Dokumen Versi | 1.0.0 |
| :--- | :--- |
| Status | Menunggu Persetujuan (Pending Review) |
| Format Repositori | Monorepo (Bun Workspaces) |
| Total Fase | 6 Fase Bertahap (Fase 0 hingga Fase 5) |

---

## 1. Strategi Pelaksanaan Bertahap (Phased Roadmap)

Setiap fase dirancang memiliki batasan yang tegas, kriteria penyelesaian (*Definition of Done*), dan pengujian verifikasi sebelum melangkah ke fase berikutnya.

```
Fase 0: Fondasi Monorepo & Lingkungan Dev
   │
   ▼
Fase 1: Database & Pemodelan Data (Prisma + PostgreSQL)
   │
   ▼
Fase 2: Shared Contracts & Type Safety (packages/shared)
   │
   ▼
Fase 3: Backend API Core (Elysia.js + Bun di apps/api)
   │
   ▼
Fase 4: Frontend Storefront & Admin Portal (Next.js di apps/web)
   │
   ▼
Fase 5: Validasi Concurrency, Hardening Keamanan & Final Audit
```

---

## 2. Rincian Fase Implementasi

### Fase 0: Fondasi Monorepo & Lingkungan Pengembangan
- **Tujuan**: Membangun struktur workspace Bun yang bersih, konfigurasi TypeScript seragam, dan container database lokal.
- **Daftar Tugas**:
  1. Buat `package.json` root dengan konfigurasi workspace Bun (`apps/*`, `packages/*`).
  2. Buat `tsconfig.base.json` dengan `strict: true` dan path alias seragam.
  3. Konfigurasi `docker-compose.yml` untuk PostgreSQL 16 dengan volume persistent.
  4. Siapkan template file lingkungan `.env.example`.
- **Kriteria Selesai (DoD)**:
  - Perintah `docker compose up -d` berhasil menjalankan PostgreSQL lokal.
  - Struktur folder monorepo terbentuk rapi tanpa konflik dependensi.

---

### Fase 1: Database & Pemodelan Data (`packages/database`)
- **Tujuan**: Menerapkan skema relasional, migrasi database, dan data awal (*seeder*).
- **Daftar Tugas**:
  1. Inisialisasi package `packages/database` dengan dependensi `@prisma/client` dan `prisma`.
  2. Implementasikan skema `prisma/schema.prisma` sesuai spesifikasi di `docs/ERD.md`.
  3. Eksekusi migrasi awal: `bun run prisma migrate dev --name init_ecommerce_schema`.
  4. Buat script seeder `prisma/seed.ts` yang mencakup:
     - 1 akun Admin default (`admin@toko.com`).
     - 1 akun Pelanggan contoh (`customer@toko.com`).
     - 3 Kategori awal (Elektronik, Fashion, Aksesoris).
     - 10 Produk contoh lengkap dengan SKU, harga, stok, dan gambar.
  5. Ekspor Prisma Client instance singleton di `packages/database/src/index.ts`.
- **Kriteria Selesai (DoD)**:
  - Migrasi sukses berjalan pada database PostgreSQL lokal.
  - Script seed terisi penuh dan dapat di-query tanpa error.

---

### Fase 2: Kontrak Data & Tipe Terdistribusi (`packages/shared`)
- **Tujuan**: Menyediakan tipe data tunggal, konstanta, dan skema validasi yang digunakan bersama oleh backend dan frontend.
- **Daftar Tugas**:
  1. Inisialisasi `packages/shared`.
  2. Buat konstanta enum (`OrderStatus`, `UserRole`, `PaymentMethods`).
  3. Definisikan tipe DTO untuk request/response (Auth, Product, Cart, Order, Admin).
  4. Buat skema validasi runtime (misal validasi format email, nomor telepon, dan batas panjang input).
- **Kriteria Selesai (DoD)**:
  - Tipe diekspor dan dapat diimpor tanpa siklus dependensi (*circular dependency*).

---

### Fase 3: Backend API Core (`apps/api` - Elysia.js + Bun)
- **Tujuan**: Membangun server RESTful API performa tinggi dengan type safety penuh dan transaksi atomik.
- **Daftar Tugas**:
  1. Setup server dasar Elysia dengan plugin `@elysiajs/cors`, `@elysiajs/swagger`, dan `@elysiajs/jwt`.
  2. **Modul Auth**:
     - Endpoint Register, Login, Logout, dan Me.
     - Penulisan JWT token ke HttpOnly Cookie (`auth_token`).
     - Middleware ekstraksi sesi dan proteksi RBAC (`derive` / `guard`).
  3. **Modul Produk & Kategori**:
     - Listing publik dengan paginasi, pencarian, dan filter kategori.
     - Detail produk berdasarkan slug dengan eager loading gambar dan kategori.
  4. **Modul Keranjang Belanja**:
     - Get cart, add item, update quantity, remove item, clear cart.
     - Pengecekan ketersediaan stok produk aktual saat penambahan kuantitas.
  5. **Modul Checkout & Pesanan**:
     - Logika transaksi atomik (`prisma.$transaction`) untuk pengurangan stok kondisional.
     - Snapshot alamat pengiriman ke format JSONB.
     - Endpoint pembatalan pesanan dan rollback stok otomatis.
  6. **Modul Dashboard & Manajemen Admin**:
     - Endpoint kalkulasi metrik ringkasan omset dan pesanan baru.
     - CRUD produk lengkap dengan pengaturan status aktif dan mutasi stok.
     - Update status pesanan beserta pencatatan ke tabel `order_status_logs`.
- **Kriteria Selesai (DoD)**:
  - Seluruh endpoint lulus pengujian manual via Swagger UI (`/swagger`).
  - Transaksi checkout berhasil memotong stok dan menggagalkan pesanan jika stok tidak cukup.

---

### Fase 4: Frontend Web Application (`apps/web` - Next.js App Router)
- **Tujuan**: Membangun pengalaman pengguna (UX) storefront yang responsif, estetis, dan panel admin yang fungsional.
- **Daftar Tugas**:
  1. Inisialisasi Next.js 14/15 App Router dengan TypeScript.
  2. Konfigurasi integrasi **Eden Treaty** untuk konsumsi API yang type-safe.
  3. **Desain Sistem & Komponen Dasar UI**:
     - Setup palet warna, tipografi modern, dan layout responsif (Navbar, Footer, Modal, Toast).
  4. **Autentikasi & Guard**:
     - Halaman Login & Register dengan penanganan pesan error yang ramah.
     - Next.js `middleware.ts` untuk memproteksi rute `/admin/*` dan `/checkout/*`.
  5. **Storefront Customer**:
     - Homepage dengan hero banner dan showcase produk pilihan.
     - Halaman katalog lengkap dengan input pencarian dan filter kategori.
     - Halaman detail produk (SSR) dengan galeri gambar dan tombol "Beli Sekarang".
     - Halaman Keranjang Belanja dengan kalkulasi subtotal realtime.
     - Halaman Checkout dengan formulir alamat dan konfirmasi pesanan.
     - Halaman Riwayat & Detail Pesanan dengan tampilan status badge.
  6. **Admin Portal**:
     - Dashboard ringkasan kartu metrik dan tabel pesanan terbaru.
     - Halaman tabel produk dengan aksi Tambah, Edit, Ubah Stok, dan Deaktivasi.
     - Halaman daftar pesanan dengan dropdown perubahan status dan input resi pengiriman.
- **Kriteria Selesai (DoD)**:
  - Alur pembelian lengkap dari halaman katalog hingga pesanan selesai berfungsi tanpa kendala di browser.
  - Panel admin dapat memperbarui stok dan memproses pesanan.

---

### Fase 5: Pengujian Concurrency, Hardening & Audit Keamanan
- **Tujuan**: Memastikan ketahanan aplikasi terhadap serangan siber umum dan situasi *high-concurrency*.
- **Daftar Tugas**:
  1. **Uji Concurrency Checkout**:
     - Eksekusi simulasi script dengan 10 request bersamaan untuk checkout produk yang hanya memiliki sisa 1 stok.
     - Verifikasi bahwa hanya tepat 1 pesanan yang berhasil dan 9 lainnya menerima error gracefully.
  2. **Audit Keamanan IDOR**:
     - Verifikasi bahwa Customer A tidak dapat mengakses atau membatalkan pesanan milik Customer B melalui manipulasi ID di URL/API.
  3. **Audit XSS & Cookie Security**:
     - Verifikasi atribut cookie `auth_token` memiliki flag `HttpOnly`, `SameSite=Lax/Strict`, dan `Secure` (di production).
  4. **Audit Validasi Input**:
     - Uji input angka negatif pada kuantitas keranjang, karakter berbahaya pada pencarian, dan email tidak valid.
- **Kriteria Selesai (DoD)**:
  - Tidak ada kebocoran data (zero IDOR).
  - Tidak terjadi overselling pada skenario perebutan stok.
  - Seluruh dokumen dan instruksi pengoperasian siap digunakan.

---

## 3. Matriks Ketergantungan Tugas (Task Dependency Graph)

```
[Fase 0: Monorepo & Docker]
         │
         ▼
[Fase 1: Prisma DB & Seed]
         │
         ▼
[Fase 2: Shared Types]
         │
         ├──────────────────────────────┐
         ▼                              ▼
[Fase 3: Backend Elysia API]    [Fase 4: Next.js UI Scaffolding]
         │                              │
         └──────────────┬───────────────┘
                        ▼
          [Integrasi Eden Treaty & Fitur]
                        │
                        ▼
      [Fase 5: Concurrency Test & Hardening]
```

---

## 4. Rencana Mitigasi Risiko Pengembangan

| Risiko Potensial | Dampak | Tindakan Pencegahan |
| :--- | :--- | :--- |
| **Ketidakcocokan Tipe antara Frontend & Backend** | Sedang | Penggunaan **Eden Treaty** langsung dari tipe aplikasi Elysia; kesalahan tipe langsung memicu error kompilasi TypeScript. |
| **Gagal Transaksi Database saat High Load** | Tinggi | Penggunaan timeout yang wajar pada Prisma interactive transaction dan mekanisme retry otomatis untuk transaksi terisolasi. |
| **Keterlambatan Sinkronisasi Auth State di Next.js** | Rendah | Menggunakan cookie berbasis HTTP yang dibaca langsung di server components (`cookies()` dari `next/headers`) sehingga tidak terjadi flash unauthenticated state. |
