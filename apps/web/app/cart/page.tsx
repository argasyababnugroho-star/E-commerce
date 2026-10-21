"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { MOCK_PRODUCTS, formatPrice } from "@/lib/mock-data";
import type { CartItemDto } from "shared";

// Mock cart state — will be replaced by real state management
const MOCK_CART_ITEMS: CartItemDto[] = [
  {
    id: "ci-1",
    productId: "1",
    productName: "Wireless Noise-Cancelling Headphones Pro",
    productSlug: "wireless-noise-cancelling-headphones-pro",
    productPrice: 2499000,
    imageUrl: MOCK_PRODUCTS[0].primaryImage,
    quantity: 1,
    currentStock: 42,
    subtotal: 2499000,
  },
  {
    id: "ci-2",
    productId: "3",
    productName: "Minimalist Leather Sneakers",
    productSlug: "minimalist-leather-sneakers",
    productPrice: 1299000,
    imageUrl: MOCK_PRODUCTS[2].primaryImage,
    quantity: 2,
    currentStock: 30,
    subtotal: 2598000,
  },
];

const SHIPPING_THRESHOLD = 500000;

export default function CartPage() {
  const items = MOCK_CART_ITEMS;
  const isEmpty = items.length === 0;

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : 35000;
  const grandTotal = subtotal + shippingFee;
  const freeShippingRemaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/products"
          className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Looks like you haven&apos;t added anything yet. Browse our products and find something you love!
          </p>
          <Link
            href="/products"
            id="cart-empty-shop-btn"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-primary text-white font-semibold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-105 transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress */}
            {freeShippingRemaining > 0 && (
              <div className="bg-accent border border-primary/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <p className="text-sm text-foreground font-medium">
                    Add{" "}
                    <span className="text-primary font-bold">{formatPrice(freeShippingRemaining)}</span>{" "}
                    more for <span className="text-primary font-bold">FREE SHIPPING</span>!
                  </p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {shippingFee === 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  🎉 You&apos;re eligible for <strong>FREE SHIPPING</strong>!
                </p>
              </div>
            )}

            {items.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all group"
              >
                {/* Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-xl overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2 block mb-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatPrice(item.productPrice)} each
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button
                        id={`cart-item-decrease-${item.id}`}
                        className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1.5 font-semibold text-sm text-foreground select-none">
                        {item.quantity}
                      </span>
                      <button
                        id={`cart-item-increase-${item.id}`}
                        disabled={item.quantity >= item.currentStock}
                        className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal + Delete */}
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">{formatPrice(item.subtotal)}</span>
                      <button
                        id={`cart-item-remove-${item.id}`}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                  </span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingFee === 0 ? "text-emerald-600 font-medium" : "text-foreground font-medium"}>
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2 mb-6 pb-6 border-b border-border">
                <input
                  id="cart-promo-code"
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button className="px-4 py-2.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
                  Apply
                </button>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-black text-foreground">{formatPrice(grandTotal)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                id="cart-checkout-btn"
                className="flex w-full items-center justify-center gap-2 py-4 gradient-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.02] transition-all duration-200 text-base"
              >
                Proceed to Checkout
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-4">
                🔒 Secure SSL Encrypted Checkout
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
