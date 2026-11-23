import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Nexbuy",
    default: "Nexbuy — Premium E-Commerce Store",
  },
  description:
    "Shop the latest electronics, fashion, home goods and more. Free shipping, secure payments, easy returns.",
  keywords: ["e-commerce", "online shop", "electronics", "fashion", "Indonesia"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Nexbuy",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar cartCount={0} />
        <main className="flex-1 pt-16 lg:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
