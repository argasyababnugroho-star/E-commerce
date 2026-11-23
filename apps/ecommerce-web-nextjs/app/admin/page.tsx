"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  RefreshCw,
  Check,
  Search,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";

interface AdminStats {
  totalRevenue: number;
  newOrdersCount: number;
  activeProductsCount: number;
  lowStockProductsCount: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  grandTotal: number;
  user: { fullName: string; email: string };
  trackingNumber?: string | null;
  createdAt: string;
}

interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: { name: string };
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 10000,
    newOrdersCount: 2,
    activeProductsCount: 11,
    lowStockProductsCount: 1,
  });

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [loading, setLoading] = useState(true);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("http://localhost:3001/api/v1/admin/dashboard/stats", {
        credentials: "include",
      });
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data);
      }

      // 2. Fetch Orders
      const ordersRes = await fetch("http://localhost:3001/api/v1/admin/orders", {
        credentials: "include",
      });
      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        if (ordersJson.success) setOrders(ordersJson.data);
      }

      // 3. Fetch Products
      const productsRes = await fetch("http://localhost:3001/api/v1/admin/products", {
        credentials: "include",
      });
      if (productsRes.ok) {
        const productsJson = await productsRes.json();
        if (productsJson.success) setProducts(productsJson.data);
      }
    } catch {
      // Offline fallback sample data
      setOrders([
        {
          id: "ord-demo-1",
          orderNumber: "ORD-20261022-4293",
          status: "PENDING",
          grandTotal: 9999000,
          user: { fullName: "Buyer 1", email: "test.concurrent.1@test.com" },
          trackingNumber: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "ord-demo-2",
          orderNumber: "ORD-20261022-3005",
          status: "PAID",
          grandTotal: 1498000,
          user: { fullName: "Budi Santoso", email: "customer@toko.com" },
          trackingNumber: "JNE-88223311",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newStatus }),
      });
      if (res.ok) {
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus as AdminOrder["status"] } : o
          )
        );
      } else {
        alert("Gagal memperbarui status. Pastikan login sebagai Admin.");
      }
    } catch {
      alert("Koneksi gagal.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdjustStock = async (productId: string, currentStock: number) => {
    const input = prompt("Masukkan jumlah stok baru:", String(currentStock));
    if (input === null) return;
    const newStock = parseInt(input, 10);
    if (isNaN(newStock) || newStock < 0) return alert("Jumlah stok tidak valid");

    try {
      const res = await fetch(`http://localhost:3001/api/v1/admin/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newStock }),
      });
      if (res.ok) {
        setProducts(
          products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      } else {
        alert("Gagal update stok.");
      }
    } catch {
      alert("Koneksi gagal.");
    }
  };

  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Portal Admin & Manajemen Toko
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Pantau omset, kelola stok persediaan, dan perbarui status pesanan.
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Muat Ulang
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total Omset</span>
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {formatPrice(stats.totalRevenue)}
            </div>
            <span className="text-xs text-success font-medium mt-1 inline-block">
              +18.4% dari bulan lalu
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Pesanan Baru</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {stats.newOrdersCount} Pesanan
            </div>
            <span className="text-xs text-muted-foreground mt-1 inline-block">
              Perlu diproses segera
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Produk Aktif</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {stats.activeProductsCount} SKU
            </div>
            <span className="text-xs text-muted-foreground mt-1 inline-block">
              Siap dijual di katalog
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Stok Menipis</span>
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-warning">
              {stats.lowStockProductsCount} Produk
            </div>
            <span className="text-xs text-warning font-medium mt-1 inline-block">
              Sisa stok ≤ 5 unit
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted/50"
            }`}
          >
            Daftar Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "products"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted/50"
            }`}
          >
            Manajemen Inventori ({products.length})
          </button>
        </div>

        {/* Tab 1: Orders Table */}
        {activeTab === "orders" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-foreground">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="py-4 px-6">No. Pesanan</th>
                    <th className="py-4 px-6">Pelanggan</th>
                    <th className="py-4 px-6">Total Tagihan</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Aksi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/20">
                      <td className="py-4 px-6 font-mono font-bold">{o.orderNumber}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold">{o.user?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{o.user?.email}</div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-primary">
                        {formatPrice(o.grandTotal)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          disabled={updatingId === o.id}
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Inventory Table */}
        {activeTab === "products" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-foreground">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="py-4 px-6">Nama Produk</th>
                    <th className="py-4 px-6">SKU</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Harga</th>
                    <th className="py-4 px-6">Stok Fisik</th>
                    <th className="py-4 px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="py-4 px-6 font-bold">{p.name}</td>
                      <td className="py-4 px-6 font-mono text-xs">{p.sku}</td>
                      <td className="py-4 px-6 text-muted-foreground">{p.category?.name}</td>
                      <td className="py-4 px-6 font-semibold">{formatPrice(p.price)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-mono font-bold px-2.5 py-1 rounded-full text-xs ${
                            p.stock <= 5
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {p.stock} Unit
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleAdjustStock(p.id, p.stock)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          Ubah Stok
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
