import { prisma } from "../index";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Users
  const adminPassword = await Bun.password.hash("Admin123!", { algorithm: "bcrypt", cost: 10 });
  const customerPassword = await Bun.password.hash("Customer123!", { algorithm: "bcrypt", cost: 10 });

  const admin = await prisma.user.upsert({
    where: { email: "admin@toko.com" },
    update: {},
    create: {
      email: "admin@toko.com",
      passwordHash: adminPassword,
      fullName: "Administrator Toko",
      phone: "+6281234567890",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@toko.com" },
    update: {},
    create: {
      email: "customer@toko.com",
      passwordHash: customerPassword,
      fullName: "Budi Santoso",
      phone: "+6281298765432",
      role: "CUSTOMER",
    },
  });

  console.log(`👤 Users seeded: ${admin.email} (ADMIN), ${customer.email} (CUSTOMER)`);

  // 2. Seed Categories
  const categoriesData = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Cutting-edge gadgets, audio devices, smart home equipment and accessories.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Modern apparel, leather shoes, minimalist streetwear and premium accessories.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description: "Ergonomic furniture, artisanal kitchenware, smart lighting and workspace essentials.",
      imageUrl: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Everyday carry essentials, sunglasses, mechanical keyboards and travel gear.",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`📁 Categories seeded: ${categoryMap.size} categories`);

  // 3. Seed Products
  const productsData = [
    {
      name: "Wireless Noise-Cancelling Headphones Pro",
      slug: "wireless-noise-cancelling-headphones-pro",
      description: "Experience silence and pure sound fidelity. Equipped with 40mm titanium drivers, advanced active noise cancellation (ANC), and up to 40 hours of continuous battery playback on a single charge.",
      price: 2499000,
      stock: 45,
      sku: "ELEC-ANC-001",
      categorySlug: "electronics",
      images: [
        { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80", isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      name: "Smart Watch Series X — Titanium Edition",
      slug: "smart-watch-series-x-titanium",
      description: "Aerospace-grade titanium case paired with ultra-tough sapphire crystal glass. Features all-day ECG monitoring, dual-band GPS navigation, and 18-day battery life with 50m water resistance.",
      price: 4999000,
      stock: 20,
      sku: "ELEC-WCH-002",
      categorySlug: "electronics",
      images: [
        { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Minimalist Leather Sneakers",
      slug: "minimalist-leather-sneakers",
      description: "Handcrafted in Florence using full-grain Italian calfskin leather. Featuring a cushioned memory foam footbed and durable Margom rubber soles for effortless elegance from office to weekend.",
      price: 1299000,
      stock: 35,
      sku: "FASH-SNK-001",
      categorySlug: "fashion",
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Ergonomic Office Chair — Lumbar Support",
      slug: "ergonomic-office-chair-lumbar",
      description: "Engineered for maximum productivity and spinal posture support. Dynamic adaptive lumbar backing, 4D adjustable armrests, and breathable high-tensile mesh.",
      price: 3799000,
      stock: 15,
      sku: "HOME-CHR-001",
      categorySlug: "home-living",
      images: [
        { url: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Ultra-Slim Mechanical Keyboard",
      slug: "ultra-slim-mechanical-keyboard",
      description: "Low-profile mechanical switches with hot-swappable sockets, RGB backlighting, aircraft aluminum frame, and tri-mode connectivity (Bluetooth 5.2, 2.4GHz wireless, USB-C).",
      price: 1599000,
      stock: 28,
      sku: "ACC-KBD-001",
      categorySlug: "accessories",
      images: [
        { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Ceramic Pour-Over Coffee Set",
      slug: "ceramic-pour-over-coffee-set",
      description: "Artisanal matte ceramic dripper, heat-resistant borosilicate glass carafe (600ml), and walnut wood base. Crafted for coffee lovers seeking optimal extraction and minimalist aesthetic.",
      price: 489000,
      stock: 60,
      sku: "HOME-COF-001",
      categorySlug: "home-living",
      images: [
        { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Minimalist Canvas Backpack",
      slug: "minimalist-canvas-backpack",
      description: "Weather-resistant 1000D Cordura canvas with waterproof YKK zippers. Includes a dedicated 16-inch padded laptop compartment, magnetic quick-access latch, and concealed passport pocket.",
      price: 849000,
      stock: 40,
      sku: "FASH-BAG-001",
      categorySlug: "fashion",
      images: [
        { url: "https://images.unsplash.com/photo-1601925228218-48bea40bd26f?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Smart Ambient Desk Lamp",
      slug: "smart-ambient-desk-lamp",
      description: "Dual-source ambient lighting with asymmetrical anti-glare screen projection. Compatible with Apple HomeKit, Google Home, and Matter. Touch bar brightness and color temperature controls.",
      price: 920000,
      stock: 25,
      sku: "HOME-LMP-001",
      categorySlug: "home-living",
      images: [
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Wireless Magnetic Power Bank 10,000mAh",
      slug: "wireless-magnetic-power-bank-10000mah",
      description: "Snap-and-charge MagSafe compatible power bank with fast 20W USB-C Power Delivery and integrated kickstand for hands-free video viewing.",
      price: 599000,
      stock: 50,
      sku: "ELEC-PWR-003",
      categorySlug: "electronics",
      images: [
        { url: "https://images.unsplash.com/photo-1609592426861-f050b16ce033?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Premium Polarized Sunglasses",
      slug: "premium-polarized-sunglasses",
      description: "Handcrafted acetate frame with UV400 anti-reflective polarized lenses. Lightweight, durable, and universally flattering silhouette.",
      price: 749000,
      stock: 30,
      sku: "ACC-SNG-002",
      categorySlug: "accessories",
      images: [
        { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80", isPrimary: true, sortOrder: 0 },
      ],
    },
  ];

  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        sku: item.sku,
        categoryId: categoryId,
        isActive: true,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        stock: item.stock,
        sku: item.sku,
        categoryId: categoryId,
        isActive: true,
      },
    });

    // Delete old images & re-insert
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const img of item.images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        },
      });
    }
  }

  console.log(`📦 Products seeded: ${productsData.length} products with images and inventory`);
  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
