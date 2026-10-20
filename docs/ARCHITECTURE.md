# System Architecture & Technical Design
## Proyek: E-Commerce MVP (Next.js + Elysia.js + Bun + PostgreSQL + Prisma)

| Dokumen Versi | 1.0.0 |
| :--- | :--- |
| Status | Menunggu Persetujuan (Pending Review) |
| Target Runtime | Bun (Backend), Node.js / Bun (Frontend Next.js) |
| Format Repositori | Monorepo (Bun Workspaces) |

---

## 1. Ikhtisar Arsitektur Sistem (High-Level Architecture)

Sistem ini dirancang menggunakan arsitektur **Decoupled Monorepo**, yang memisahkan aplikasi frontend dan backend ke dalam direktori independen (`apps/web` dan `apps/api`), sambil berbagi definisi tipe data dan skema database melalui *shared packages* (`packages/database` dan `packages/shared`).

```
┌───────────────────────────────────────────────────────────┐
│                      Client Browser                       │
│  (Desktop, Mobile, Tablet - Server-Rendered HTML + React) │
└─────────────┬───────────────────────────────▲─────────────┘
              │                               │
              │ HTTPS (Pages / Assets)        │ JSON API Responses
              ▼                               │
┌───────────────────────────┐                 │
│         apps/web          │                 │
│    (Next.js App Router)   │                 │
│  - React Server Comps     │                 │
│  - Client Interactivity   │                 │
│  - SSR Catalog / Detail   │                 │
│  - Middleware Route Guard │                 │
└─────────────┬─────────────┘                 │
              │                               │
              │ HTTP / REST via Eden Treaty   │
              ▼                               │
┌─────────────────────────────────────────────┴─────────────┐
│                         apps/api                          │
│                   (Elysia.js on Bun)                      │
│  - High-throughput HTTP Server                            │
│  - End-to-End Type Safety via TypeBox / Eden              │
│  - Auth & RBAC Middleware (JWT in HttpOnly Cookie)        │
│  - Business Logic Services (Orders, Cart, Products)       │
│  - Concurrency Lock (Atomic Stock Transactions)           │
└─────────────┬───────────────────────────────▲─────────────┘
              │                               │
              │ Prisma Client Queries         │ Result Sets
              ▼                               │
┌─────────────────────────────────────────────┴─────────────┐
│                    packages/database                      │
│            (Prisma ORM & PostgreSQL Database)             │
│  - ACID Transactions                                      │
│  - Relational Integrity & Foreign Keys                    │
│  - Migrations & Seeders                                   │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Direktori Monorepo (Monorepo Directory Layout)

Sistem menggunakan **Bun Workspaces** untuk resolusi dependensi yang cepat dan hemat disk space:

```
ecommerce/
├── apps/
│   ├── web/                         # Frontend (Next.js 14/15 App Router)
│   │   ├── app/                     # App Router Directory
│   │   │   ├── (auth)/              # Route Group: login, register
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (shop)/              # Route Group: customer storefront
│   │   │   │   ├── layout.tsx       # Storefront Navbar, Footer, Cart Drawer
│   │   │   │   ├── page.tsx         # Homepage / Featured Catalog
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx     # Catalog listing with search & filters
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx # Product Detail Page (SSR)
│   │   │   │   ├── cart/
│   │   │   │   │   └── page.tsx     # Shopping Cart Page
│   │   │   │   ├── checkout/
│   │   │   │   │   └── page.tsx     # Checkout form & order submission
│   │   │   │   └── orders/
│   │   │   │       ├── page.tsx     # Order History list
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx # Order Detail & payment instructions
│   │   │   ├── admin/               # Protected Admin Portal
│   │   │   │   ├── layout.tsx       # Admin Sidebar & Header
│   │   │   │   ├── page.tsx         # Admin Dashboard (Overview metrics)
│   │   │   │   ├── products/        # Product CRUD pages
│   │   │   │   │   ├── page.tsx     # Product table with status & stock
│   │   │   │   │   ├── new/page.tsx # Create product form
│   │   │   │   │   └── [id]/edit/page.tsx # Edit product form
│   │   │   │   └── orders/          # Admin Order Management
│   │   │   │       ├── page.tsx     # Order list with status filters
│   │   │   │       └── [id]/page.tsx# Order processing & status update
│   │   │   ├── api/                 # Next.js Route Handlers (jika dibutuhkan proxy/BFF)
│   │   │   ├── layout.tsx           # Root Layout (Fonts, Providers, Toast)
│   │   │   └── globals.css          # Design system & utility styling
│   │   ├── components/              # Shared UI & Feature Components
│   │   │   ├── ui/                  # Atom UI (Button, Input, Card, Modal, Badge)
│   │   │   ├── storefront/          # ProductCard, CartItem, FilterSidebar
│   │   │   └── admin/               # MetricsCard, DataTable, OrderStatusBadge
│   │   ├── lib/                     # Utilities, API client (Eden Treaty), Auth helpers
│   │   ├── middleware.ts            # Next.js Route Guard (Auth & Admin role protection)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                         # Backend (Elysia.js running on Bun)
│       ├── src/
│       │   ├── index.ts             # Server entry point, CORS, Swagger setup
│       │   ├── config/              # App config, env variables validation
│       │   ├── middlewares/         # Auth guard, Error handler, Logger, Rate limit
│       │   ├── modules/             # Domain Driven Feature Modules
│       │   │   ├── auth/            # Auth router, service, DTOs
│       │   │   ├── products/        # Product catalog & admin CRUD
│       │   │   ├── categories/      # Category management
│       │   │   ├── cart/            # Cart service & calculations
│       │   │   ├── orders/          # Checkout, atomic stock deduction, history
│       │   │   └── admin/           # Dashboard stats & admin operations
│       │   └── utils/               # Hash utils, order code generator, response helper
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/                    # Shared Database Package
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Prisma Schema Definition
│   │   │   ├── migrations/          # SQL Migration history
│   │   │   └── seed.ts              # Database Seeder (Admin user, Sample products)
│   │   ├── src/
│   │   │   └── index.ts             # Prisma Client instance singleton export
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                      # Shared Types, Schemas, & Constants
│       ├── src/
│       │   ├── types/               # TypeScript interfaces & DTOs
│       │   ├── constants/           # Order statuses, roles, error codes
│       │   └── validators/          # Shared Zod / TypeBox validation schemas
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                            # Project Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ERD.md
│   ├── API.md
│   └── IMPLEMENTATION-PLAN.md
│
├── docker-compose.yml               # PostgreSQL local container
├── package.json                     # Root Workspace configuration
├── bun.lockb                        # Bun Lockfile
├── tsconfig.base.json               # Base TypeScript configuration
└── .env.example                     # Environment variables template
```

---

## 3. Matriks Keputusan Teknologi (Technology Stack & Rationale)

| Komponen | Pilihan Teknologi | Alasan Pemilihan & Keunggulan |
| :--- | :--- | :--- |
| **Backend Runtime** | **Bun** | Startup super cepat, native TypeScript support tanpa build step manual, I/O performa tinggi, efisiensi memori luar biasa dibandingkan Node.js. |
| **Backend Framework** | **Elysia.js** | Didesain khusus untuk Bun, performa sekelas C++ / Rust, *first-class type safety* dengan TypeBox, integrasi **Eden Treaty** yang menyajikan typesafe RPC ke Next.js. |
| **Frontend Framework** | **Next.js (App Router)** | Komponen Server (RSC) memberikan SEO optimal dan TTFB cepat untuk katalog e-commerce, routing berbasis folder intuitif, code splitting otomatis, caching terintegrasi. |
| **Database** | **PostgreSQL (v15/16)** | RDBMS handal dengan dukungan ACID penuh, performa transaksi tinggi, integritas referensial kaku, dan fitur JSONB untuk menyimpan snapshot alamat pemesanan. |
| **ORM** | **Prisma ORM** | Type-safety dari skema ke query, migrasi database deklaratif yang andal, pencegahan SQL Injection bawaan, dukungan *interactive transaction* untuk mutasi stok. |
| **Type-Safe Contract** | **Eden Treaty** | Menghubungkan Elysia.js dengan Next.js secara *end-to-end type safe*. Perubahan schema pada API langsung terdeteksi sebagai error di frontend saat kompilasi. |
| **Styling** | **Vanilla CSS / Modern CSS Variables** | Desain fleksibel, kontrol penuh atas visual micro-interactions, performa rendering tinggi tanpa kompilasi CSS yang berat. |

---

## 4. Pola Komunikasi & Type Safety (Data Flow Protocol)

Sistem menggunakan **Eden Treaty** (`@elysiajs/eden`) untuk komunikasi antara Next.js dan Elysia.js:

1. **Definisi Route di Elysia (`apps/api`)**:
   Setiap endpoint Elysia diekspor tipe aplikasinya (`export type App = typeof app`).
2. **Konsumsi di Next.js (`apps/web`)**:
   Frontend mengimpor tipe `App` melalui:
   ```typescript
   import { treaty } from '@elysiajs/eden';
   import type { App } from 'api';
   export const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL);
   ```
3. **Keuntungan**:
   - Autocomplete otomatis untuk path URL, query params, headers, dan request body.
   - Deteksi *breaking change* seketika di frontend jika backend mengubah response contract.
   - Validasi runtime otomatis di backend menggunakan schema TypeBox.

---

## 5. Arsitektur Otentikasi & Otorisasi (Authentication & RBAC)

Sistem mengadopsi pola **Stateless JWT dengan HttpOnly Secure Cookie**:

```
[Client / Next.js]                    [Elysia.js Backend]                [PostgreSQL]
        │                                      │                               │
        │─── POST /api/v1/auth/login ─────────>│                               │
        │    (email, password)                 │─── Cari user by email ───────>│
        │                                      │<── User record (hash) ────────│
        │                                      │                               │
        │                                      │─── Verifikasi Hash (Argon2)   │
        │                                      │─── Generate JWT Token         │
        │<── Set-Cookie: auth_token=...; ──────│                               │
        │    HttpOnly; Secure; SameSite=Lax    │                               │
        │                                      │                               │
        │─── GET /api/v1/orders (dengan cookie)│                               │
        │                                      │─── Verifikasi JWT Signature   │
        │                                      │─── Ekstrak { userId, role }   │
        │                                      │─── Query Data Milik User ────>│
        │<── 200 OK (Data Pesanan User) ───────│<── Result ────────────────────│
```

### Mekanisme Keamanan Token:
- **HttpOnly**: JavaScript sisi browser (termasuk potensi serangan XSS) tidak dapat membaca token.
- **SameSite=Lax**: Melindungi dari serangan Cross-Site Request Forgery (CSRF).
- **Secure**: Cookie hanya dikirimkan melalui jalur terenkripsi HTTPS (diaktifkan otomatis di production).
- **RBAC Guard**:
  - Middleware Next.js memeriksa eksistensi cookie dan membaca payload token untuk rute `/admin/*`.
  - Elysia.js memvalidasi tanda tangan JWT pada setiap request API yang dilindungi dan memastikan `role === 'ADMIN'` untuk endpoint admin.

---

## 6. Strategi Transaksi & Penanganan Concurrency (Race Conditions)

Masalah krusial dalam e-commerce adalah **overselling** (dua pelanggan membeli barang stok terakhir di saat yang sama). 

### Solusi: Prisma Interactive Transaction & Atomic Conditional Decrement
Saat proses checkout berlangsung, Elysia menjalankan transaksi terisolasi:

```typescript
await prisma.$transaction(async (tx) => {
  for (const item of cartItems) {
    // 1. Eksekusi update kondisional: hanya kurangi jika stok >= kuantitas yang dibeli
    const updatedProduct = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.quantity },
        isActive: true,
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });

    // 2. Jika tidak ada baris yang ter-update, berarti stok tidak mencukupi
    if (updatedProduct.count === 0) {
      throw new Error(`Stok produk "${item.productName}" tidak mencukupi.`);
    }
  }

  // 3. Buat pesanan dan order items
  const order = await tx.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: customerId,
      status: 'PENDING',
      totalAmount: calculatedTotal,
      shippingAddress: addressSnapshot,
      items: {
        create: cartItems.map(...),
      },
    },
  });

  // 4. Bersihkan keranjang belanja
  await tx.cartItem.deleteMany({
    where: { userId: customerId },
  });

  return order;
});
```

Jika terjadi kegagalan pada salah satu produk, transaksi akan di-*rollback* secara penuh oleh database PostgreSQL, memastikan tidak ada pengurangan stok separuh jalan ataupun pesanan bodong.

---

## 7. Siklus Hidup Status Pesanan (Order State Machine)

Pesanan mengikuti alur status yang kaku untuk menjaga akurasi inventaris:

```mermaid
stateDiagram-v2
    [*] --> PENDING : Checkout Berhasil (Stok Dikurangi)
    
    PENDING --> PAID : Admin Verifikasi Pembayaran
    PENDING --> CANCELLED : Dibatalkan Pelanggan/Admin (Stok Dikembalikan)
    
    PAID --> PROCESSING : Pesanan Dikemas
    PAID --> CANCELLED : Refund / Pembatalan (Stok Dikembalikan)
    
    PROCESSING --> SHIPPED : Dikirim ke Kurir (Input Resi)
    
    SHIPPED --> DELIVERED : Diterima Pelanggan
    
    DELIVERED --> [*]
    CANCELLED --> [*]
```

- **Rollback Stok**: Transisi ke status `CANCELLED` (baik dari `PENDING` maupun `PAID`) secara otomatis mengembalikan jumlah barang ke tabel `products` menggunakan database transaction.

---

## 8. Strategi Deployment & Lingkungan (Environment Strategy)

- **Development**:
  - PostgreSQL dijalankan melalui container Docker (`docker-compose.yml`).
  - `bun --watch` menjalankan API di port `3001`.
  - Next.js dev server berjalan di port `3000`.
- **Environment Variables**:
  - `DATABASE_URL`: URI koneksi PostgreSQL (`postgresql://user:pass@localhost:5432/ecommerce_db`).
  - `JWT_SECRET`: Secret key berkekuatan tinggi untuk penandatanganan token.
  - `NEXT_PUBLIC_API_URL`: URL publik backend API.
  - `PORT`: Port backend (default: 3001).
