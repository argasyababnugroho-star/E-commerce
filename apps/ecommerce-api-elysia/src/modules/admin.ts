import { Elysia, t } from "elysia";
import { prisma } from "database";
import { authPlugin, requireAdmin } from "../plugins/auth";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(authPlugin)
  // 1. Dashboard Metrics
  .get("/dashboard/stats", async ({ user, set }) => {
    requireAdmin(user, set);

    const [revenueResult, newOrdersCount, activeProductsCount, lowStockProductsCount] =
      await Promise.all([
        prisma.order.aggregate({
          where: {
            status: { not: "CANCELLED" },
          },
          _sum: {
            grandTotal: true,
          },
        }),
        prisma.order.count({
          where: {
            status: { in: ["PENDING", "PAID"] },
          },
        }),
        prisma.product.count({
          where: { isActive: true },
        }),
        prisma.product.count({
          where: {
            isActive: true,
            stock: { lte: 5 },
          },
        }),
      ]);

    const totalRevenue = Number(revenueResult._sum.grandTotal || 0);

    return {
      success: true,
      data: {
        totalRevenue,
        newOrdersCount,
        activeProductsCount,
        lowStockProductsCount,
      },
    };
  })

  // 2. Products Management
  .get("/products", async ({ user, query, set }) => {
    requireAdmin(user, set);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const [totalItems, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      stock: p.stock,
      sku: p.sku,
      isActive: p.isActive,
      category: p.category,
      primaryImage: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || null,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formatted,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  })
  .post(
    "/products",
    async ({ user, body, set }) => {
      requireAdmin(user, set);
      const { name, slug, categoryId, description, price, stock, sku, images = [] } = body;

      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        set.status = 400;
        return {
          success: false,
          error: { code: "SKU_ALREADY_EXISTS", message: "SKU sudah digunakan oleh produk lain." },
        };
      }

      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const product = await prisma.product.create({
        data: {
          name,
          slug: generatedSlug,
          categoryId,
          description,
          price,
          stock,
          sku,
          isActive: true,
          images: {
            create: images.map((img, idx) => ({
              url: img.url,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: idx,
            })),
          },
        },
        include: {
          category: true,
          images: true,
        },
      });

      set.status = 201;
      return {
        success: true,
        data: product,
        message: "Produk berhasil ditambahkan.",
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        slug: t.Optional(t.String()),
        categoryId: t.String(),
        description: t.String(),
        price: t.Number({ minimum: 0 }),
        stock: t.Number({ minimum: 0 }),
        sku: t.String({ minLength: 2 }),
        images: t.Optional(
          t.Array(
            t.Object({
              url: t.String(),
              isPrimary: t.Optional(t.Boolean()),
            })
          )
        ),
      }),
    }
  )
  .put(
    "/products/:id",
    async ({ user, params: { id }, body, set }) => {
      requireAdmin(user, set);
      const { name, categoryId, description, price, stock, sku, isActive, images } = body;

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        set.status = 404;
        return {
          success: false,
          error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." },
        };
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (images && images.length > 0) {
          await tx.productImage.deleteMany({ where: { productId: id } });
          await tx.productImage.createMany({
            data: images.map((img, idx) => ({
              productId: id,
              url: img.url,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: idx,
            })),
          });
        }

        return tx.product.update({
          where: { id },
          data: {
            name,
            categoryId,
            description,
            price,
            stock,
            sku,
            isActive,
          },
          include: {
            category: true,
            images: true,
          },
        });
      });

      return {
        success: true,
        data: updated,
        message: "Produk berhasil diperbarui.",
      };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
        description: t.Optional(t.String()),
        price: t.Optional(t.Number({ minimum: 0 })),
        stock: t.Optional(t.Number({ minimum: 0 })),
        sku: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
        images: t.Optional(
          t.Array(
            t.Object({
              url: t.String(),
              isPrimary: t.Optional(t.Boolean()),
            })
          )
        ),
      }),
    }
  )
  .patch(
    "/products/:id/stock",
    async ({ user, params: { id }, body, set }) => {
      requireAdmin(user, set);
      const { newStock } = body;

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        set.status = 404;
        return {
          success: false,
          error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." },
        };
      }

      const updated = await prisma.product.update({
        where: { id },
        data: { stock: newStock },
      });

      return {
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          stock: updated.stock,
        },
        message: `Stok produk berhasil disesuaikan menjadi ${newStock} unit.`,
      };
    },
    {
      body: t.Object({
        newStock: t.Number({ minimum: 0 }),
        reason: t.Optional(t.String()),
      }),
    }
  )
  .delete("/products/:id", async ({ user, params: { id }, set }) => {
    requireAdmin(user, set);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      set.status = 404;
      return {
        success: false,
        error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." },
      };
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: "Produk berhasil dinonaktifkan.",
    };
  })

  // 3. Orders Management
  .get("/admin/orders", async ({ user, query, set }) => {
    requireAdmin(user, set);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: "insensitive" } },
        { user: { fullName: { contains: query.search, mode: "insensitive" } } },
        { user: { email: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    const [totalItems, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          items: true,
        },
      }),
    ]);

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      user: o.user,
      totalAmount: Number(o.totalAmount),
      shippingFee: Number(o.shippingFee),
      grandTotal: Number(o.grandTotal),
      paymentMethod: o.paymentMethod,
      shippingAddress: o.shippingAddressSnapshot,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.length,
    }));

    return {
      success: true,
      data: formatted,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  })
  .patch(
    "/orders/:id/status",
    async ({ user, params: { id }, body, set }) => {
      const admin = requireAdmin(user, set);
      const { newStatus, trackingNumber, notes } = body;

      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        set.status = 404;
        return {
          success: false,
          error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." },
        };
      }

      await prisma.$transaction(async (tx) => {
        // If transitioning to CANCELLED from non-cancelled, restore stock
        if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // Update order
        const updateData: Record<string, unknown> = {
          status: newStatus,
        };

        if (trackingNumber) {
          updateData.trackingNumber = trackingNumber;
        }

        if (newStatus === "PAID" && !order.paidAt) {
          updateData.paidAt = new Date();
        } else if (newStatus === "CANCELLED" && !order.cancelledAt) {
          updateData.cancelledAt = new Date();
        }

        await tx.order.update({
          where: { id },
          data: updateData,
        });

        // Log status transition
        await tx.orderStatusLog.create({
          data: {
            orderId: id,
            previousStatus: order.status,
            newStatus,
            notes: notes || `Status diubah menjadi ${newStatus} oleh Admin`,
            changedById: admin.id,
          },
        });
      });

      return {
        success: true,
        message: `Status pesanan ${order.orderNumber} berhasil diperbarui menjadi ${newStatus}.`,
      };
    },
    {
      body: t.Object({
        newStatus: t.Union([
          t.Literal("PENDING"),
          t.Literal("PAID"),
          t.Literal("PROCESSING"),
          t.Literal("SHIPPED"),
          t.Literal("DELIVERED"),
          t.Literal("CANCELLED"),
        ]),
        trackingNumber: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    }
  );
