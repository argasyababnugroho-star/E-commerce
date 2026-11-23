import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProductDto } from "shared";

interface ProductCardProps {
  product: ProductDto;
  className?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <article
      className={cn(
        "product-card group relative bg-card rounded-2xl border border-border overflow-hidden",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent to-muted">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4 text-slate-700" />
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4 text-slate-700" />
            </Link>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isOutOfStock && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
              Out of Stock
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge variant="warning" className="text-[10px] px-2 py-0.5">
              Only {product.stock} left
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-[11px] font-medium text-primary uppercase tracking-wider mb-1">
          {product.category.name}
        </p>

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating (mock) */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-3 h-3",
                star <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
              )}
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">(24)</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          <button
            disabled={isOutOfStock}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "gradient-primary text-white hover:opacity-90 hover:scale-105 shadow-md shadow-primary/20"
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

/* Skeleton version */
export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded-full w-20" />
        <div className="h-4 skeleton rounded-full w-full" />
        <div className="h-3 skeleton rounded-full w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-5 skeleton rounded-full w-24" />
          <div className="h-8 skeleton rounded-xl w-16" />
        </div>
      </div>
    </div>
  );
}
