# API Specification & Contracts
## Proyek: E-Commerce MVP (Elysia.js + Bun)

| Dokumen Versi | 1.0.0 |
| :--- | :--- |
| Status | Menunggu Persetujuan (Pending Review) |
| Protokol | HTTP / RESTful API (Type-safe via Eden Treaty) |
| Base URL | `http://localhost:3001/api/v1` |

---

## 1. Standar Desain API (API Conventions)

### 1.1. Format Respons Standar
Seluruh endpoint menggunakan format *envelope response* yang konsisten.

**Respons Berhasil (Success)**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil diselesaikan"
}
```

**Respons Berhasil dengan Paginasi (Paginated List)**:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 12,
    "totalItems": 48,
    "totalPages": 4
  }
}
```

**Respons Gagal (Error)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format email tidak valid atau password kurang dari 8 karakter",
    "details": [ ... ]
  }
}
```

### 1.2. Mekanisme Otentikasi
- **Cookie-Based JWT**: Token otentikasi disimpan di cookie dengan nama `auth_token`.
- Backend memvalidasi cookie ini secara otomatis pada rute terproteksi.
- Header alternatif (untuk pengujian pihak ketiga/Postman): `Authorization: Bearer <token>`.

---

## 2. Modul Otentikasi (`/auth`)

### 2.1. Registrasi Akun Pelanggan
- **Method**: `POST`
- **Path**: `/auth/register`
- **Akses**: Publik
- **Request Body**:
  ```json
  {
    "fullName": "Ahmad Subagyo",
    "email": "ahmad@example.com",
    "password": "PasswordRahasia123!",
    "phone": "081234567890"
  }
  ```
- **Responses**:
  - `201 Created`: User terdaftar dan otomatis dibuatkan sesi (Set-Cookie `auth_token`).
    ```json
    {
      "success": true,
      "data": {
        "id": "e2f1b402-9a08-410a-b33a-18b0e7cfd3b1",
        "email": "ahmad@example.com",
        "fullName": "Ahmad Subagyo",
        "role": "CUSTOMER"
      },
      "message": "Registrasi akun berhasil"
    }
    ```
  - `400 Bad Request`: Email sudah terdaftar (`EMAIL_ALREADY_EXISTS`).

### 2.2. Login Pengguna
- **Method**: `POST`
- **Path**: `/auth/login`
- **Akses**: Publik
- **Request Body**:
  ```json
  {
    "email": "ahmad@example.com",
    "password": "PasswordRahasia123!"
  }
  ```
- **Responses**:
  - `200 OK`: Berhasil login, menyetel HttpOnly Cookie `auth_token`.
    ```json
    {
      "success": true,
      "data": {
        "id": "e2f1b402-9a08-410a-b33a-18b0e7cfd3b1",
        "email": "ahmad@example.com",
        "fullName": "Ahmad Subagyo",
        "role": "CUSTOMER"
      },
      "message": "Login berhasil"
    }
    ```
  - `401 Unauthorized`: Kredensial tidak cocok (`INVALID_CREDENTIALS`).

### 2.3. Logout
- **Method**: `POST`
- **Path**: `/auth/logout`
- **Akses**: Terotentikasi
- **Responses**:
  - `200 OK`: Menghapus cookie `auth_token`.

### 2.4. Profil Saya (Me)
- **Method**: `GET`
- **Path**: `/auth/me`
- **Akses**: Terotentikasi (Customer / Admin)
- **Responses**:
  - `200 OK`: Mengembalikan data pengguna aktif.

---

## 3. Modul Produk & Kategori Publik (`/products`, `/categories`)

### 3.1. Daftar Katalog Produk
- **Method**: `GET`
- **Path**: `/products`
- **Akses**: Publik
- **Query Parameters**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 12)
  - `search` (string, optional - cari nama produk)
  - `categoryId` (uuid, optional)
  - `minPrice` (number, optional)
  - `maxPrice` (number, optional)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "c1f1b402-9a08-410a-b33a-18b0e7cfd3b9",
          "name": "Kemeja Katun Pria Formal",
          "slug": "kemeja-katun-pria-formal",
          "price": "249000.00",
          "stock": 15,
          "category": { "id": "cat-1", "name": "Pakaian" },
          "primaryImage": "https://assets.example.com/kemeja-1.jpg"
        }
      ],
      "meta": { "page": 1, "limit": 12, "totalItems": 1, "totalPages": 1 }
    }
    ```

### 3.2. Detail Produk
- **Method**: `GET`
- **Path**: `/products/:slug`
- **Akses**: Publik
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "id": "c1f1b402-9a08-410a-b33a-18b0e7cfd3b9",
        "name": "Kemeja Katun Pria Formal",
        "slug": "kemeja-katun-pria-formal",
        "description": "Bahan katun 100% adem dan nyaman digunakan seharian...",
        "price": "249000.00",
        "stock": 15,
        "sku": "KEM-KAT-001",
        "category": { "id": "cat-1", "name": "Pakaian", "slug": "pakaian" },
        "images": [
          { "id": "img-1", "url": "https://assets.example.com/kemeja-1.jpg", "isPrimary": true },
          { "id": "img-2", "url": "https://assets.example.com/kemeja-2.jpg", "isPrimary": false }
        ]
      }
    }
    ```
  - `404 Not Found`: Produk tidak ditemukan.

### 3.3. Daftar Kategori
- **Method**: `GET`
- **Path**: `/categories`
- **Akses**: Publik
- **Responses**:
  - `200 OK`: Mengembalikan daftar kategori beserta jumlah produk aktif di dalamnya.

---

## 4. Modul Keranjang Belanja (`/cart`)

### 4.1. Ambil Keranjang Pengguna
- **Method**: `GET`
- **Path**: `/cart`
- **Akses**: Terotentikasi (Customer)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "id": "cart-item-1",
            "productId": "c1f1b402-9a08-410a-b33a-18b0e7cfd3b9",
            "productName": "Kemeja Katun Pria Formal",
            "productSlug": "kemeja-katun-pria-formal",
            "productPrice": "249000.00",
            "imageUrl": "https://assets.example.com/kemeja-1.jpg",
            "quantity": 2,
            "currentStock": 15,
            "subtotal": "498000.00"
          }
        ],
        "totalQuantity": 2,
        "totalAmount": "498000.00"
      }
    }
    ```

### 4.2. Tambah Item ke Keranjang
- **Method**: `POST`
- **Path**: `/cart/items`
- **Akses**: Terotentikasi (Customer)
- **Request Body**:
  ```json
  {
    "productId": "c1f1b402-9a08-410a-b33a-18b0e7cfd3b9",
    "quantity": 1
  }
  ```
- **Responses**:
  - `200 OK`: Item ditambahkan atau kuantitas di-increment jika sudah ada.
  - `400 Bad Request`: Kuantitas melebihi sisa stok (`EXCEEDS_STOCK`).

### 4.3. Update Kuantitas Item Keranjang
- **Method**: `PATCH`
- **Path**: `/cart/items/:id`
- **Akses**: Terotentikasi (Customer)
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```

### 4.4. Hapus Item dari Keranjang
- **Method**: `DELETE`
- **Path**: `/cart/items/:id`
- **Akses**: Terotentikasi (Customer)

---

## 5. Modul Checkout & Pesanan Pelanggan (`/orders`)

### 5.1. Buat Pesanan (Checkout)
- **Method**: `POST`
- **Path**: `/orders/checkout`
- **Akses**: Terotentikasi (Customer)
- **Request Body**:
  ```json
  {
    "shippingAddress": {
      "recipientName": "Ahmad Subagyo",
      "phone": "081234567890",
      "street": "Jl. Merdeka No. 45, RT 02 / RW 05",
      "city": "Jakarta Selatan",
      "province": "DKI Jakarta",
      "postalCode": "12340"
    },
    "paymentMethod": "MANUAL_BANK_TRANSFER",
    "notes": "Tolong kirim saat jam kerja"
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "data": {
        "orderId": "ord-uuid-001",
        "orderNumber": "ORD-20261020-0081",
        "status": "PENDING",
        "totalAmount": "498000.00",
        "shippingFee": "15000.00",
        "grandTotal": "513000.00",
        "paymentInstructions": {
          "bankName": "Bank Central Asia (BCA)",
          "accountNumber": "8820-1122-3344",
          "accountHolder": "PT E-Commerce Indonesia"
        }
      },
      "message": "Pesanan berhasil dibuat. Silakan lakukan pembayaran."
    }
    ```
  - `409 Conflict`: Terjadi perebutan stok dan stok telah habis (`STOCK_INSUFFICIENT`).

### 5.2. Riwayat Pesanan Pengguna
- **Method**: `GET`
- **Path**: `/orders`
- **Akses**: Terotentikasi (Customer)
- **Query Parameters**: `page`, `limit`, `status`

### 5.3. Rincian Pesanan
- **Method**: `GET`
- **Path**: `/orders/:id`
- **Akses**: Terotentikasi (Customer pemilik pesanan atau Admin)

### 5.4. Pembatalan Pesanan Mandiri
- **Method**: `POST`
- **Path**: `/orders/:id/cancel`
- **Akses**: Terotentikasi (Customer)
- **Ketentuan**: Hanya berlaku untuk pesanan berstatus `PENDING`. Stok dikembalikan otomatis.

---

## 6. Modul Administrasi (`/admin`)

*Catatan: Seluruh endpoint di bawah ini diproteksi oleh middleware verifikasi Role `ADMIN`.*

### 6.1. Dashboard Metrik
- **Method**: `GET`
- **Path**: `/admin/dashboard/stats`
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "totalRevenue": "128450000.00",
        "newOrdersCount": 14,
        "activeProductsCount": 85,
        "lowStockProductsCount": 6
      }
    }
    ```

### 6.2. Manajemen Produk (Admin CRUD)
- `GET /admin/products`: Ambil daftar lengkap seluruh produk (termasuk yang non-aktif).
- `POST /admin/products`: Tambah produk baru beserta URL gambar.
  ```json
  {
    "name": "Sepatu Lari Sporty X",
    "slug": "sepatu-lari-sporty-x",
    "categoryId": "cat-uuid-01",
    "description": "Sepatu ringan untuk marathon...",
    "price": 599000,
    "stock": 30,
    "sku": "RUN-SPT-X",
    "images": [
      { "url": "https://assets.example.com/shoe-1.jpg", "isPrimary": true }
    ]
  }
  ```
- `PUT /admin/products/:id`: Edit seluruh informasi produk.
- `PATCH /admin/products/:id/stock`: Penyesuaian stok langsung.
  ```json
  {
    "newStock": 50,
    "reason": "Restok dari gudang pusat"
  }
  ```
- `DELETE /admin/products/:id`: Deaktivasi produk (soft-delete, `isActive = false`).

### 6.3. Manajemen Pesanan & Status (Admin Orders)
- `GET /admin/orders`: Ambil daftar seluruh pesanan toko dengan filter status dan rentang tanggal.
- `GET /admin/orders/:id`: Ambil detail pesanan lengkap beserta riwayat log perubahan status.
- `PATCH /admin/orders/:id/status`: Pembaruan status pesanan:
  ```json
  {
    "newStatus": "SHIPPED",
    "trackingNumber": "JNE-9988776655",
    "notes": "Paket telah diserahkan ke gerai kurir"
  }
  ```
  *Jika `newStatus === 'CANCELLED'`, sistem mengeksekusi transaksi pengembalian stok ke tabel `products`.*
