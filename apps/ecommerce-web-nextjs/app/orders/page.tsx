"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";

interface OrderItem {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: string;
  trackingNumber?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:3001/api/v1/orders", {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setOrders(json.data);
        } else {
          // Provide sample mock order for guests / unauthenticated preview
          setOrders([
            {
              id: "ord-1",
              orderNumber: "ORD-20261022-4293",
              status: "PENDING",
              totalAmount: 2499000,
              shippingFee: 0,
              grandTotal: 2499000,
              paymentMethod: "MANUAL_BANK_TRANSFER",
              trackingNumber: null,
              createdAt: new Date().toISOString(),
              items: [
                {
                  id: "item-1",
                  productName: "Wireless Noise-Cancelling Headphones Pro",
                  productPrice: 2499000,
                  quantity: 1,
                  subtotal: 2499000,
                },
              ],
            },
          ]);
        }
      } catch {
        // Fallback demo order
        setOrders([
          {
            id: "ord-1",
            orderNumber: "ORD-20261022-4293",
            status: "PENDING",
            totalAmount: 2499000,
            shippingFee: 0,
            grandTotal: 2499000,
            paymentMethod: "MANUAL_BANK_TRANSFER",
            trackingNumber: null,
            createdAt: new Date().toISOString(),
            items: [
              {
                id: "item-1",
                productName: "Wireless Noise-Cancelling Headphones Pro",
                productPrice: 2499000,
                quantity: 1,
                subtotal: 2499000,
              },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/v1/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: "CANCELLED" } : o
          )
        );
        alert("Pesanan berhasil dibatalkan.");
      } else {
        alert(data.error?.message || "Gagal membatalkan pesanan.");
      }
    } catch {
      alert("Koneksi gagal. Coba lagi beberapa saat.");
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Pembayaran
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dibayar
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Package className="w-3.5 h-3.5" />
            Diproses
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500">
            <Truck className="w-3.5 h-3.5" />
            Dikirim
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
            <XCircle className="w-3.5 h-3.5" />
            Dibatalkan
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Riwayat Pesanan
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Pantau status pesanan, pembayaran, dan resi pengiriman Anda.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Memuat riwayat pesanan...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-bold text-foreground mb-1">
              Belum Ada Pesanan
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Anda belum melakukan pemesanan apa pun. Temukan berbagai produk pilihan sekarang!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Waktu Pemesanan:{" "}
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <span className="text-xs text-muted-foreground block">
                      Total Pesanan
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(order.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium text-foreground">
                          {item.productName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer / Actions */}
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {order.trackingNumber ? (
                      <span className="flex items-center gap-1 font-mono text-foreground font-medium">
                        <Truck className="w-3.5 h-3.5 text-primary" /> Resi: {order.trackingNumber}
                      </span>
                    ) : (
                      <span>Metode: {order.paymentMethod.replace(/_/g, " ")}</span>
                    )}
                  </div>

                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-xs font-semibold text-destructive hover:underline"
                    >
                      Batalkan Pesanan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
