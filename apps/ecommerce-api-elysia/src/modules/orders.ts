import { Elysia, t } from "elysia";
import { prisma } from "database";
import { authPlugin, requireAuth } from "../plugins/auth";

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .post(
    "/checkout",
    async ({ user, body, set }) => {
      const authed = requireAuth(user, set);
      const { shippingAddress, paymentMethod = "MANUAL_BANK_TRANSFER", notes } = body;

      // 1. Fetch current user's cart items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: authed.id },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "CART_EMPTY",
            message: "Keranjang belanja Anda kosong. Silakan pilih produk terlebih dahulu.",
          },
        };
      }

      try {
        // 2. Execute atomic transaction for stock decrement and order creation
        const newOrder = await prisma.$transaction(async (tx) => {
          let calculatedTotal = 0;

          // Check & decrement stock for each item atomically
          for (const item of cartItems) {
            const price = Number(item.product.price);
            calculatedTotal += price * item.quantity;

            // Atomic decrement: only decrements if current stock >= quantity
            const updateResult = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity },
                isActive: true,
              },
              data: {
                stock: { decrement: item.quantity },
              },
            });

            if (updateResult.count === 0) {
              throw new Error(`STOCK_INSUFFICIENT:${item.product.name}`);
            }
          }

          // Shipping calculation: Free shipping for orders >= 500,000, else 15,000
          const shippingFee = calculatedTotal >= 500000 ? 0 : 15000;
          const grandTotal = calculatedTotal + shippingFee;

          // Generate order number ORD-YYYYMMDD-XXXX
          const now = new Date();
          const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

          // Create order record
          const order = await tx.order.create({
            data: {
              orderNumber,
              userId: authed.id,
              status: "PENDING",
              totalAmount: calculatedTotal,
              shippingFee,
              grandTotal,
              paymentMethod,
              shippingAddressSnapshot: shippingAddress,
              notes: notes || null,
              items: {
                create: cartItems.map((item) => ({
                  productId: item.productId,
                  productName: item.product.name,
                  productPrice: Number(item.product.price),
                  quantity: item.quantity,
                  subtotal: Number(item.product.price) * item.quantity,
                })),
              },
              statusLogs: {
                create: {
                  previousStatus: null,
                  newStatus: "PENDING",
                  notes: "Pesanan berhasil dibuat, menunggu pembayaran pelanggan.",
                  changedById: authed.id,
                },
              },
            },
            include: {
              items: true,
            },
          });

          // Empty the user's cart
          await tx.cartItem.deleteMany({
            where: { userId: authed.id },
          });

          return order;
        });

        set.status = 201;
        return {
          success: true,
          data: {
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            status: newOrder.status,
            totalAmount: Number(newOrder.totalAmount),
            shippingFee: Number(newOrder.shippingFee),
            grandTotal: Number(newOrder.grandTotal),
            paymentInstructions: {
              bankName: "Bank Central Asia (BCA)",
              accountNumber: "8820-1122-3344",
              accountHolder: "PT Nexbuy E-Commerce Indonesia",
            },
          },
          message: "Pesanan berhasil dibuat. Silakan lakukan pembayaran.",
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.startsWith("STOCK_INSUFFICIENT:")) {
          const prodName = errorMsg.replace("STOCK_INSUFFICIENT:", "");
          set.status = 409;
          return {
            success: false,
            error: {
              code: "STOCK_INSUFFICIENT",
              message: `Stok produk "${prodName}" tidak mencukupi untuk menyelesaikan pesanan.`,
            },
          };
        }

        set.status = 500;
        return {
          success: false,
          error: {
            code: "CHECKOUT_FAILED",
            message: "Gagal memproses pesanan. Silakan coba kembali.",
            details: errorMsg,
          },
        };
      }
    },
    {
      body: t.Object({
        shippingAddress: t.Object({
          recipientName: t.String({ minLength: 2 }),
          phone: t.String({ minLength: 8 }),
          street: t.String({ minLength: 5 }),
          city: t.String({ minLength: 2 }),
          province: t.Optional(t.String()),
          postalCode: t.String({ minLength: 3 }),
        }),
        paymentMethod: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .get("/", async ({ user, query, set }) => {
    const authed = requireAuth(user, set);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId: authed.id,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [totalItems, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
    ]);

    const formatted = orders.map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      status: ord.status,
      totalAmount: Number(ord.totalAmount),
      shippingFee: Number(ord.shippingFee),
      grandTotal: Number(ord.grandTotal),
      paymentMethod: ord.paymentMethod,
      shippingAddress: ord.shippingAddressSnapshot,
      trackingNumber: ord.trackingNumber,
      notes: ord.notes,
      paidAt: ord.paidAt,
      cancelledAt: ord.cancelledAt,
      createdAt: ord.createdAt.toISOString(),
      items: ord.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: Number(item.productPrice),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
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
  .get("/:id", async ({ user, params: { id }, set }) => {
    const authed = requireAuth(user, set);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusLogs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      set.status = 404;
      return {
        success: false,
        error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" },
      };
    }

    // IDOR protection: only owner or ADMIN can view order
    if (order.userId !== authed.id && authed.role !== "ADMIN") {
      set.status = 403;
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses ke pesanan ini" },
      };
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        shippingFee: Number(order.shippingFee),
        grandTotal: Number(order.grandTotal),
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddressSnapshot,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        paidAt: order.paidAt,
        cancelledAt: order.cancelledAt,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          productPrice: Number(i.productPrice),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
        statusLogs: order.statusLogs.map((l) => ({
          id: l.id,
          previousStatus: l.previousStatus,
          newStatus: l.newStatus,
          notes: l.notes,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    };
  })
  .post("/:id/cancel", async ({ user, params: { id }, set }) => {
    const authed = requireAuth(user, set);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      set.status = 404;
      return {
        success: false,
        error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" },
      };
    }

    // IDOR protection
    if (order.userId !== authed.id && authed.role !== "ADMIN") {
      set.status = 403;
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Anda tidak berhak membatalkan pesanan ini" },
      };
    }

    if (order.status !== "PENDING") {
      set.status = 400;
      return {
        success: false,
        error: {
          code: "CANNOT_CANCEL",
          message: `Pesanan dengan status ${order.status} tidak dapat dibatalkan secara mandiri.`,
        },
      };
    }

    // Execute atomic cancellation: restore stock and update status
    await prisma.$transaction(async (tx) => {
      // Restore stock for all items
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // Log status change
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          previousStatus: "PENDING",
          newStatus: "CANCELLED",
          notes: "Pesanan dibatalkan oleh pelanggan. Stok produk telah dikembalikan.",
          changedById: authed.id,
        },
      });
    });

    return {
      success: true,
      message: "Pesanan berhasil dibatalkan dan stok produk telah dikembalikan.",
    };
  });
