"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatPrice, MOCK_PRODUCTS } from "@/lib/mock-data";

interface ShippingForm {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const [formData, setFormData] = useState<ShippingForm>({
    recipientName: "Budi Santoso",
    phone: "081298765432",
    street: "Jl. Sudirman Kav. 21, Gedung Bursa Efek",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12190",
  });

  const [paymentMethod, setPaymentMethod] = useState<"MANUAL_BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "E_WALLET">("MANUAL_BANK_TRANSFER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    grandTotal: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  } | null>(null);

  // Cart items display
  const checkoutItems = [
    {
      product: MOCK_PRODUCTS[0],
      quantity: 1,
    },
    {
      product: MOCK_PRODUCTS[1],
      quantity: 1,
    },
  ];

  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 500000 ? 0 : 15000;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/api/v1/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shippingAddress: formData,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess({
          orderNumber: data.data.orderNumber,
          grandTotal: data.data.grandTotal,
          bankName: data.data.paymentInstructions.bankName,
          accountNumber: data.data.paymentInstructions.accountNumber,
          accountHolder: data.data.paymentInstructions.accountHolder,
        });
      } else {
        // Fallback demo order number for unauthenticated users
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        setOrderSuccess({
          orderNumber: `ORD-${dateStr}-${randomSuffix}`,
          grandTotal: grandTotal,
          bankName: "Bank Central Asia (BCA)",
          accountNumber: "8820-1122-3344",
          accountHolder: "PT Nexbuy E-Commerce Indonesia",
        });
      }
    } catch {
      // Offline / fallback mock success
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setOrderSuccess({
        orderNumber: `ORD-${dateStr}-${randomSuffix}`,
        grandTotal: grandTotal,
        bankName: "Bank Central Asia (BCA)",
        accountNumber: "8820-1122-3344",
        accountHolder: "PT Nexbuy E-Commerce Indonesia",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-xl text-center">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-muted-foreground mb-8">
            Terima kasih telah berbelanja di Nexbuy. Silakan lakukan pembayaran sesuai petunjuk di bawah ini.
          </p>

          <div className="bg-muted/50 border border-border rounded-xl p-6 text-left mb-8 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Nomor Pesanan</span>
              <span className="font-mono font-bold text-foreground">
                {orderSuccess.orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Total Tagihan</span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(orderSuccess.grandTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Metode Pembayaran</span>
              <span className="font-medium text-foreground">{orderSuccess.bankName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Nomor Rekening</span>
              <span className="font-mono font-bold text-foreground select-all">
                {orderSuccess.accountNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Atas Nama</span>
              <span className="font-medium text-foreground">
                {orderSuccess.accountHolder}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Lihat Riwayat Pesanan
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
            >
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Checkout & Pembayaran
          </h1>
          <p className="text-muted-foreground mt-1">
            Lengkapi alamat pengiriman dan pilih metode pembayaran favorit Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-8 space-y-8">
            {/* Shipping Address Section */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    1. Alamat Pengiriman
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Pastikan rincian alamat dan kontak penerima sudah tepat
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nomor WhatsApp / Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Alamat Lengkap (Jalan, RT/RW, No. Rumah) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Provinsi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Kode Pos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    2. Metode Pembayaran
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Transaksi aman & terenkripsi 256-bit SSL
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "MANUAL_BANK_TRANSFER"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="MANUAL_BANK_TRANSFER"
                    checked={paymentMethod === "MANUAL_BANK_TRANSFER"}
                    onChange={() => setPaymentMethod("MANUAL_BANK_TRANSFER")}
                    className="sr-only"
                  />
                  <Building2 className="w-6 h-6 text-primary mb-2" />
                  <span className="font-semibold text-foreground text-sm">
                    Transfer Bank Manual
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    BCA, Mandiri, BNI
                  </span>
                </label>

                <label
                  className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "VIRTUAL_ACCOUNT"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="VIRTUAL_ACCOUNT"
                    checked={paymentMethod === "VIRTUAL_ACCOUNT"}
                    onChange={() => setPaymentMethod("VIRTUAL_ACCOUNT")}
                    className="sr-only"
                  />
                  <CreditCard className="w-6 h-6 text-primary mb-2" />
                  <span className="font-semibold text-foreground text-sm">
                    Virtual Account
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Verifikasi Otomatis
                  </span>
                </label>

                <label
                  className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "E_WALLET"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="E_WALLET"
                    checked={paymentMethod === "E_WALLET"}
                    onChange={() => setPaymentMethod("E_WALLET")}
                    className="sr-only"
                  />
                  <Wallet className="w-6 h-6 text-primary mb-2" />
                  <span className="font-semibold text-foreground text-sm">
                    E-Wallet / QRIS
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    GoPay, OVO, ShopeePay
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-foreground pb-4 border-b border-border flex items-center justify-between">
                <span>Ringkasan Pesanan</span>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                  {checkoutItems.length} Produk
                </span>
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 m-auto text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quantity}x {formatPrice(product.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Produk</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Ongkos Kirim</span>
                  <span className="text-foreground font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-success font-semibold">GRATIS</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-foreground pt-3 border-t border-border">
                  <span>Total Tagihan</span>
                  <span className="text-primary text-xl font-black">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Secure Checkout Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Bayar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Garansi 100% Uang Kembali & Pembayaran Aman</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
