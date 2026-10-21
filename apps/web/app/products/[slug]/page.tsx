import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
} from "lucide-react";
import { MOCK_PRODUCTS, formatPrice } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) notFound();

  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category.slug === product.category.slug
  ).slice(0, 4);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Back Button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </Link>

      {/* Product Detail Grid */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
            {product.primaryImage ? (
              <Image
                src={product.primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent to-muted">
                <span className="text-8xl">📦</span>
              </div>
            )}
            {/* Badge overlay */}
            <div className="absolute top-4 left-4">
              {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
              {isLowStock && !isOutOfStock && (
                <Badge variant="warning">Only {product.stock} left!</Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary"
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Category */}
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-sm font-medium text-primary uppercase tracking-wider hover:underline"
          >
            {product.category.name}
          </Link>

          {/* Name */}
          <h1 className="text-3xl lg:text-4xl font-black text-foreground mt-2 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">4.2 (127 reviews)</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-success font-medium">
              {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-black text-foreground">{formatPrice(product.price)}</span>
            <p className="text-sm text-muted-foreground mt-1">Includes tax · Free shipping available</p>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-8 border-t border-border pt-6">
            {product.description}
          </p>

          {/* SKU */}
          <p className="text-xs text-muted-foreground mb-8">
            SKU: <span className="font-mono">{product.sku}</span>
          </p>

          {/* Quantity + Cart */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Quantity */}
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                id="product-qty-decrease"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                −
              </button>
              <span className="px-6 py-3 font-semibold text-foreground select-none">1</span>
              <button
                id="product-qty-increase"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              id="product-add-to-cart"
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                isOutOfStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "gradient-primary text-white hover:opacity-90 hover:scale-[1.02] shadow-xl shadow-primary/20"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {/* Wishlist */}
            <button
              id="product-wishlist"
              className="p-3 border border-border rounded-xl text-muted-foreground hover:text-red-500 hover:border-red-500/50 transition-all"
              aria-label="Add to wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Share */}
            <button
              id="product-share"
              className="p-3 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label="Share product"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Truck, text: "Free shipping over Rp 500K" },
              { icon: ShieldCheck, text: "Secure payment" },
              { icon: RotateCcw, text: "30-day returns" },
              { icon: Package, text: "Tracked delivery" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border pt-16">
          <h2 className="text-2xl font-black text-foreground mb-8">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
