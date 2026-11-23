import { Elysia, t } from "elysia";
import { prisma } from "database";
import { authPlugin, requireAuth } from "../plugins/auth";

export const cartRoutes = new Elysia({ prefix: "/cart" })
  .use(authPlugin)
  .get("/", async ({ user, set }) => {
    const authed = requireAuth(user, set);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: authed.id },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = cartItems.map((item) => {
      const price = Number(item.product.price);
      const subtotal = price * item.quantity;
      const imageUrl =
        item.product.images[0]?.url ||
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80";

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productPrice: price,
        imageUrl,
        quantity: item.quantity,
        currentStock: item.product.stock,
        subtotal,
      };
    });

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      success: true,
      data: {
        items,
        totalQuantity,
        totalAmount,
      },
    };
  })
  .post(
    "/items",
    async ({ user, body, set }) => {
      const authed = requireAuth(user, set);
      const { productId, quantity } = body;

      const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true },
      });

      if (!product) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Produk tidak ditemukan atau tidak aktif",
          },
        };
      }

      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: authed.id,
            productId,
          },
        },
      });

      const targetQuantity = (existingCartItem?.quantity || 0) + quantity;

      if (targetQuantity > product.stock) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "EXCEEDS_STOCK",
            message: `Jumlah melebihi stok yang tersedia (${product.stock} unit).`,
          },
        };
      }

      const cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: authed.id,
            productId,
          },
        },
        update: {
          quantity: targetQuantity,
        },
        create: {
          userId: authed.id,
          productId,
          quantity,
        },
      });

      return {
        success: true,
        data: cartItem,
        message: "Item berhasil ditambahkan ke keranjang",
      };
    },
    {
      body: t.Object({
        productId: t.String(),
        quantity: t.Number({ minimum: 1 }),
      }),
    }
  )
  .patch(
    "/items/:id",
    async ({ user, params: { id }, body, set }) => {
      const authed = requireAuth(user, set);
      const { quantity } = body;

      const cartItem = await prisma.cartItem.findFirst({
        where: { id, userId: authed.id },
        include: { product: true },
      });

      if (!cartItem) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: "ITEM_NOT_FOUND",
            message: "Item keranjang tidak ditemukan",
          },
        };
      }

      if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id } });
        return {
          success: true,
          message: "Item dihapus dari keranjang",
        };
      }

      if (quantity > cartItem.product.stock) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "EXCEEDS_STOCK",
            message: `Jumlah melebihi sisa stok (${cartItem.product.stock} unit).`,
          },
        };
      }

      const updated = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });

      return {
        success: true,
        data: updated,
      };
    },
    {
      body: t.Object({
        quantity: t.Number(),
      }),
    }
  )
  .delete("/items/:id", async ({ user, params: { id }, set }) => {
    const authed = requireAuth(user, set);

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId: authed.id },
    });

    if (!cartItem) {
      set.status = 404;
      return {
        success: false,
        error: {
          code: "ITEM_NOT_FOUND",
          message: "Item keranjang tidak ditemukan",
        },
      };
    }

    await prisma.cartItem.delete({ where: { id } });

    return {
      success: true,
      message: "Item berhasil dihapus dari keranjang",
    };
  })
  .delete("/", async ({ user, set }) => {
    const authed = requireAuth(user, set);

    await prisma.cartItem.deleteMany({
      where: { userId: authed.id },
    });

    return {
      success: true,
      message: "Seluruh keranjang berhasil dikosongkan",
    };
  });
