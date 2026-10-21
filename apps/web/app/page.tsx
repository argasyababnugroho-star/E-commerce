import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Nexbuy — Premium E-Commerce Store",
  description:
    "Shop the latest electronics, fashion, home goods and more. Free shipping on orders over Rp 500.000. Secure payments guaranteed.",
};

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over Rp 500.000",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "100% protected checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "GoPay, OVO, Bank Transfer",
  },
];

const stats = [
  { label: "Products", value: "10,000+" },
  { label: "Happy Customers", value: "500K+" },
  { label: "Brands", value: "200+" },
  { label: "Countries", value: "15+" },
];

export default function HomePage() {
  const featuredProducts = MOCK_PRODUCTS.slice(0, 8);

  return (
    <div className="page-transition">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(252,87%,70%) 1px, transparent 1px), linear-gradient(90deg, hsl(252,87%,70%) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>New Season Collection 2025</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white mb-6">
                Shop The{" "}
                <span className="gradient-text">Future</span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md">
                Discover curated products from the world&apos;s best brands. Premium quality,
                unbeatable prices, delivered fast to your door.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  href="/products"
                  id="hero-shop-now-btn"
                  className="inline-flex items-center gap-2 px-8 py-4 gradient-primary text-white font-semibold rounded-2xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xl shadow-violet-500/25"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products?sort=new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <TrendingUp className="w-5 h-5" />
                  New Arrivals
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Product Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {MOCK_PRODUCTS.slice(0, 4).map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`glass rounded-2xl p-4 hover:scale-105 transition-all duration-300 animate-float`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/10 mb-3">
                    {product.primaryImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-violet-300 font-bold mt-1">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-slate-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-center gap-4 p-6">
                <div className="p-2.5 rounded-xl bg-accent">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Browse by</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">Categories</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            View all
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              id={`category-${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </span>
              <span className="text-sm font-semibold text-foreground text-center">{cat.name}</span>
              <span className="text-[11px] text-muted-foreground text-center hidden sm:block">
                {cat.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Handpicked for you</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">Featured Products</h2>
          </div>
          <Link
            href="/products"
            id="view-all-products-link"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            View all products
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12 sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Promo Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-cyan-500 p-12 lg:p-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-black/10 rounded-full blur-2xl" />
          </div>
          <div className="relative max-w-xl">
            <p className="text-white/80 text-sm font-medium mb-3 uppercase tracking-wider">Limited Time Offer</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Register today and get an exclusive 20% discount on your first purchase. No minimum order!
            </p>
            <Link
              href="/register"
              id="promo-register-btn"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Claim Your Discount
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
