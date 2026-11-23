import { Elysia, t } from "elysia";
import { prisma } from "database";

export const productRoutes = new Elysia()
  .get(
    "/products",
    async ({ query }) => {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        isActive: true,
      };

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ];
      }

      if (query.categoryId) {
        where.categoryId = query.categoryId;
      }

      if (query.categorySlug) {
        where.category = { slug: query.categorySlug };
      }

      if (query.minPrice || query.maxPrice) {
        where.price = {};
        if (query.minPrice) {
          (where.price as Record<string, unknown>).gte = Number(query.minPrice);
        }
        if (query.maxPrice) {
          (where.price as Record<string, unknown>).lte = Number(query.maxPrice);
        }
      }

      let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
      if (query.sort === "price_asc") {
        orderBy = { price: "asc" };
      } else if (query.sort === "price_desc") {
        orderBy = { price: "desc" };
      } else if (query.sort === "new") {
        orderBy = { createdAt: "desc" };
      }

      const [totalItems, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        }),
      ]);

      const formatted = products.map((p) => {
        const primaryImage =
          p.images.find((img) => img.isPrimary)?.url ||
          p.images[0]?.url ||
          null;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: Number(p.price),
          stock: p.stock,
          sku: p.sku,
          isActive: p.isActive,
          category: p.category,
          primaryImage,
          images: p.images.map((img) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
        };
      });

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
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
        categorySlug: t.Optional(t.String()),
        minPrice: t.Optional(t.String()),
        maxPrice: t.Optional(t.String()),
        sort: t.Optional(t.String()),
      }),
    }
  )
  .get("/products/:slug", async ({ params: { slug }, set }) => {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      set.status = 404;
      return {
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Produk tidak ditemukan atau telah dinonaktifkan.",
        },
      };
    }

    const primaryImage =
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      null;

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        sku: product.sku,
        category: product.category,
        primaryImage,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      },
    };
  })
  .get("/categories", async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        productCount: cat._count.products,
      })),
    };
  });
