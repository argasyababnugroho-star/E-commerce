import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Nexbuy for free. Get access to exclusive deals, fast checkout and order tracking.",
};

const benefits = [
  "Exclusive member-only discounts",
  "One-click checkout",
  "Order tracking & history",
  "Wishlist & saved items",
];

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 page-transition">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-black/5">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🚀</div>
            <h1 className="text-2xl font-black text-foreground">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Join 500,000+ happy shoppers on Nexbuy
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-accent rounded-2xl">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form id="register-form" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="register-firstname" className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <input
                  id="register-firstname"
                  type="text"
                  autoComplete="given-name"
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
              <div>
                <label htmlFor="register-lastname" className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <input
                  id="register-lastname"
                  type="text"
                  autoComplete="family-name"
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-xl text-sm text-muted-foreground">
                  🇮🇩 +62
                </span>
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="812-3456-7890"
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat your password"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="register-terms"
                type="checkbox"
                required
                className="rounded border-border mt-0.5"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              id="register-submit"
              type="submit"
              className="w-full py-3.5 gradient-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.01] transition-all duration-200 text-sm"
            >
              Create Account — It&apos;s Free!
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
