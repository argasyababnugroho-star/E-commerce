# Product Requirements Document (PRD)
## Proyek: E-Commerce MVP (Minimum Viable Product)

| Dokumen Versi | 1.0.0 |
| :--- | :--- |
| Status | Menunggu Persetujuan (Pending Review) |
| Target Framework | Next.js (App Router), Elysia.js (Bun), PostgreSQL, Prisma |
| Arsitektur | Monorepo (apps/web, apps/api) |

---

## 1. Ringkasan Eksekutif & Tujuan Proyek

Proyek ini bertujuan untuk membangun platform e-commerce MVP dengan arsitektur monorepo modern, performa tinggi, dan *type-safe* dari *database* hingga *user interface*. 

Tujuan utama MVP adalah:
1. Memvalidasi alur belanja inti (*core shopping journey*): penemuan produk, penambahan ke keranjang, dan pembuatan pesanan.
2. Memfasilitasi operasional penjual/admin: manajemen katalog produk, pemantauan inventaris stok, dan pembaruan siklus status pesanan.
3. Memastikan performa eksekusi dan efisiensi resource yang superior menggunakan **Bun** + **Elysia.js** pada sisi backend, serta SEO dan UX optimal menggunakan **Next.js App Router** pada sisi frontend.

---

## 2. Target Pengguna (User Personas)

### 2.1. Pelanggan (Customer / Buyer)
- **Karakteristik**: Pengguna umum yang mencari, meninjau, dan membeli produk.
- **Kebutuhan**:
  - Tampilan katalog yang cepat, responsif, dan mudah difilter/dicari.
  - Alur transaksi (keranjang & checkout) yang ringkas tanpa hambatan.
  - Transparansi status pesanan dan kemudahan melihat riwayat pembelian.

### 2.2. Administrator Toko (Store Admin)
- **Karakteristik**: Pengelola operasional toko dan katalog.
- **Kebutuhan**:
  - Dashboard ringkasan metrik penjualan (total omset, pesanan baru, stok menipis).
  - Manajemen produk (tambah, edit harga/deskripsi, upload gambar, penyesuaian stok).
  - Pemrosesan pesanan dari tahap pembayaran hingga pengiriman.

---

## 3. Batasan Lingkup MVP (Scope & Out-of-Scope)

### 3.1. Fitur Dalam Lingkup (In-Scope MVP)
- **Otentikasi & Profil**: Registrasi pelanggan, login (JWT HttpOnly Cookie), peran (Customer & Admin), profil dasar.
- **Katalog & Detail Produk**: Halaman listing produk, pencarian judul/kategori, pagination, dan halaman detail produk lengkap dengan stok tersedia.
- **Keranjang Belanja**: Simpan item ke keranjang (persistent per user), update kuantitas, hapus item, validasi stok dinamis.
- **Checkout & Pembuatan Pesanan**: Snapshot alamat pengiriman, kalkulasi total biaya, simulasi metode pembayaran (Transfer Bank Manual / Mock Gateway), pembuatan pesanan dengan status awal `PENDING`.
- **Riwayat & Detail Pesanan**: Pelanggan dapat melihat daftar pesanan terdahulu beserta statusnya.
- **Admin Dashboard**: Kartu metrik (omset, total pesanan, jumlah produk aktif, alert stok kritis).
- **Admin Manajemen Produk (CRUD)**: Formulir tambah/ubah produk, penentuan kategori, SKU, harga, stok, dan soft-delete/deaktivasi.
- **Admin Pengelolaan Pesanan & Stok**: Update status pesanan (`PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), mutasi penyesuaian stok manual.

### 3.2. Fitur Di Luar Lingkup (Out-of-Scope MVP)
- Integrasi Payment Gateway nyata (Midtrans/Xendit/Stripe) — *menggunakan mock flow/konfirmasi manual pada MVP*.
- Integrasi Kurir Eksternal otomatis (RajaOngkir/JNE API) — *menggunakan tarif flat/mock shipping fee pada MVP*.
- Sistem Review, Rating, & Diskusi Produk.
- Multi-toko (Multi-vendor marketplace).
- Fitur Diskon/Kupon/Voucher kompleks.
- Live Chat Customer Support.

---

## 4. Analisis Kebutuhan Fungsional (Functional Requirements)

### Modul 1: Otentikasi & Otorisasi (Auth & RBAC)
- **REQ-AUTH-01**: Pengguna dapat mendaftar dengan nama lengkap, email unik, dan password (minimal 8 karakter).
- **REQ-AUTH-02**: Password wajib di-hash menggunakan algoritma aman (`Argon2id` atau `bcrypt`).
- **REQ-AUTH-03**: Pengguna dapat login dan menerima session token yang disimpan dalam HTTP-only Cookie untuk mitigasi serangan XSS.
- **REQ-AUTH-04**: Sistem menerapkan Role-Based Access Control (RBAC) dengan 2 peran: `CUSTOMER` dan `ADMIN`.
- **REQ-AUTH-05**: Pengguna dapat logout (menghapus cookie session).
- **REQ-AUTH-06**: Proteksi rute: Admin rute (`/admin/*`) hanya dapat diakses oleh peran `ADMIN`.

### Modul 2: Katalog & Detail Produk (Catalog & Discovery)
- **REQ-PROD-01**: Pengunjung (guest maupun customer) dapat melihat daftar produk aktif dengan pagination (12 item per halaman).
- **REQ-PROD-02**: Pengunjung dapat mencari produk berdasarkan kata kunci nama produk.
- **REQ-PROD-03**: Pengunjung dapat memfilter produk berdasarkan kategori dan rentang harga.
- **REQ-PROD-04**: Pengunjung dapat membuka detail produk yang menampilkan: judul, slug, gambar, deskripsi lengkap, harga, kategori, dan sisa stok.
- **REQ-PROD-05**: Jika stok produk = 0, sistem menampilkan label "Habis" dan menonaktifkan tombol tambah ke keranjang.

### Modul 3: Keranjang Belanja (Shopping Cart)
- **REQ-CART-01**: Pengguna yang terotentikasi dapat menambahkan produk ke keranjang belanja.
- **REQ-CART-02**: Sistem memvalidasi bahwa jumlah yang ditambahkan tidak melebihi sisa stok produk aktual.
- **REQ-CART-03**: Pengguna dapat mengubah kuantitas item atau menghapus item dari keranjang.
- **REQ-CART-04**: Keranjang tersimpan di database terikat dengan `user_id` sehingga persisten di lintas perangkat.
- **REQ-CART-05**: Sistem menghitung subtotal per item dan total keseluruhan harga keranjang secara realtime.

### Modul 4: Checkout & Pembuatan Pesanan (Checkout & Orders)
- **REQ-ORD-01**: Pengguna dapat melakukan checkout dari item keranjang yang valid.
- **REQ-ORD-02**: Pengguna memasukkan atau memilih alamat pengiriman (nama penerima, nomor telepon, alamat lengkap, kota, kode pos).
- **REQ-ORD-03**: Sistem menyimpan alamat pengiriman dalam bentuk *snapshot* (JSON/kolom terdedikasi) di dalam data pesanan agar perubahan alamat profil di masa depan tidak merusak histori pesanan.
- **REQ-ORD-04**: **Pengurangan Stok Otomatis**: Saat pesanan dibuat, stok produk langsung dikurangi secara atomik di dalam database transaction (`prisma.$transaction`).
- **REQ-ORD-05**: Jika terjadi *concurrency* (dua pengguna checkout barang terakhir bersamaan), sistem harus menggagalkan transaksi yang stoknya tidak mencukupi dengan pesan error yang jelas (mencegah *overselling*).
- **REQ-ORD-06**: Setelah checkout berhasil, item terkait dihapus dari keranjang dan pesanan diberi nomor unik (misal: `ORD-YYYYMMDD-XXXXX`) dengan status awal `PENDING`.

### Modul 5: Riwayat & Status Pesanan (Customer Order History)
- **REQ-HIST-01**: Pengguna dapat melihat daftar seluruh pesanan mereka beserta tanggal, total pembayaran, dan status terkini.
- **REQ-HIST-02**: Pengguna dapat melihat rincian pesanan: daftar item, harga saat beli, alamat tujuan, dan instruksi pembayaran.
- **REQ-HIST-03**: Pengguna dapat membatalkan pesanan yang masih berstatus `PENDING` (stok dikembalikan secara otomatis ke produk).

### Modul 6: Dashboard Admin (Admin Dashboard)
- **REQ-DASH-01**: Admin dapat melihat ringkasan metrik:
  - Total Pendapatan (*Revenue*) dari pesanan berstatus `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`.
  - Jumlah pesanan masuk baru yang membutuhkan aksi.
  - Total produk aktif.
  - Daftar produk dengan stok menipis (di bawah ambang batas, misal < 5).
- **REQ-DASH-02**: Admin dapat melihat 10 transaksi pesanan terbaru.

### Modul 7: Manajemen Produk Admin (Admin Product CRUD)
- **REQ-ADM-PROD-01**: Admin dapat menambahkan produk baru (nama, slug unik, deskripsi, harga, stok, kategori, URL gambar).
- **REQ-ADM-PROD-02**: Admin dapat memperbarui informasi produk dan mengubah status aktif/non-aktif.
- **REQ-ADM-PROD-03**: Admin dapat melakukan soft-delete atau menonaktifkan produk agar tidak merusak data relasi pesanan masa lalu.

### Modul 8: Pengelolaan Pesanan & Stok Admin (Admin Orders & Inventory)
- **REQ-ADM-ORD-01**: Admin dapat melihat seluruh daftar pesanan dengan filter status (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **REQ-ADM-ORD-02**: Admin dapat memperbarui status pesanan (misal: memverifikasi pembayaran `PAID`, menandai `SHIPPED` dengan input nomor resi/catatan).
- **REQ-ADM-ORD-03**: Setiap perubahan status pesanan dicatat dalam tabel audit/log riwayat status (`order_status_logs`).
- **REQ-ADM-ORD-04**: Jika Admin membatalkan pesanan (`CANCELLED`), sistem mengembalikan stok produk yang bersangkutan ke inventaris.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Performa**:
   - Respon API (Elysia.js) untuk operasi baca standar < 50ms pada P95.
   - Core Web Vitals pada Next.js (LCP < 2.5s, CLS < 0.1, FID/INP < 200ms).
2. **Keamanan (Security)**:
   - Sanitasi seluruh input menggunakan skema validasi `TypeBox` (Elysia) dan `Zod` (Next.js).
   - Penggunaan HttpOnly, Secure, SameSite Cookie untuk Session/JWT token.
   - Rate limiting pada endpoint sensitif (login, register, checkout).
   - Pencegahan IDOR (*Insecure Direct Object References*) pada akses pesanan dan keranjang.
3. **Integritas Data (Data Integrity)**:
   - Penggunaan ACID Database Transactions pada mutasi stok dan pembuatan pesanan.
   - Foreign key constraints dan cascading rules yang aman.
4. **Skalabilitas & Maintainability**:
   - Monorepo terstruktur dengan *shared types/contracts* untuk mencegah desinkronisasi API frontend-backend.
   - Kode modular mengikuti prinsip Single Responsibility.

---

## 6. Pemetaan Ketergantungan Antarfitur (Feature Dependency Mapping)

```
[Otentikasi & Akun] 
       │
       ├──────────────────────────────┐
       ▼                              ▼
[Katalog Produk]              [Alamat Pengguna]
       │                              │
       ▼                              │
[Keranjang Belanja]                   │
       │                              │
       └──────────────┬───────────────┘
                      ▼
             [Checkout & Pesanan]
                      │
       ┌──────────────┴──────────────┐
       ▼                             ▼
[Riwayat Pesanan Pelanggan]    [Dashboard & Manajemen Pesanan Admin]
                                     │
                                     ▼
                               [Manajemen Stok]
```

### Matriks Dependensi:
1. **Keranjang Belanja** bergantung pada: **Otentikasi** dan **Katalog Produk** (status aktif & stok > 0).
2. **Checkout & Pesanan** bergantung pada: **Keranjang Belanja**, **Alamat Pengguna**, dan **Katalog Produk** (transaksi penguncian stok).
3. **Riwayat Pesanan** bergantung pada: **Checkout & Pesanan** dan **Otentikasi**.
4. **Dashboard Admin & Kelola Pesanan** bergantung pada: **Checkout & Pesanan** dan **RBAC Admin**.
5. **Manajemen Stok** berelasi timbal balik dengan: **Checkout & Pesanan** (pengurangan saat order, pengembalian saat batal).

---

## 7. Analisis Risiko Keamanan & Rencana Mitigasi

| Kategori Risiko | Potensi Dampak | Skenario Kerentanan | Strategi Mitigasi Terencana |
| :--- | :--- | :--- | :--- |
| **Race Condition / Overselling** | Tinggi (Kerugian Finansial) | Dua pembeli checkout sisa 1 barang secara bersamaan dalam milidetik yang sama. | Menggunakan Prisma Interactive Transaction (`prisma.$transaction`) dengan validasi stok kaku atau conditional update (`UPDATE products SET stock = stock - qty WHERE id = ... AND stock >= qty`). |
| **IDOR (Insecure Direct Object Reference)** | Tinggi (Kebocoran Privasi) | Pengguna mengganti `orderId` pada URL untuk melihat pesanan milik orang lain. | Validasi kepemilikan (`WHERE id = :orderId AND user_id = :currentUser.id`) di middleware/handler API; peran `ADMIN` memiliki bypass terkontrol. |
| **Tampering Harga & Nilai Pesanan** | Kritis (Pencurian Nilai) | Klien mengirimkan payload harga murah saat submit checkout. | **Backend Authority**: Frontend hanya mengirimkan `productId` dan `quantity`. Backend menghitung ulang seluruh harga dan subtotal langsung dari database. |
| **Brute Force & Credential Stuffing** | Sedang - Tinggi | Serangan login otomatis secara massal. | Terapkan rate limiter pada rute `/api/v1/auth/login` dan `/api/v1/auth/register` (maks 5 request per menit per IP). |
| **XSS & Token Theft** | Tinggi | Script berbahaya mencuri access token dari localStorage. | Simpan session/token hanya pada **HTTP-only, Secure, SameSite=Strict** Cookies. Token tidak dapat diakses via JavaScript browser. |
| **CSRF (Cross-Site Request Forgery)** | Sedang | Pengguna tertipu memicu aksi state-changing (checkout, update cart) dari situs lain. | Penerapan SameSite=Lax/Strict pada cookies dan header verifikasi Origin/Referer pada mutasi API. |
| **Price / Stock Underflow** | Sedang | Input kuantitas negatif (`-5`) untuk memanipulasi total harga atau menambah stok. | Skema validasi kaku: kuantitas wajib `integer`, `min: 1`. |
