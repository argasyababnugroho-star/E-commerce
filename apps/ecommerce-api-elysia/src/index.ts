import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./modules/auth";
import { productRoutes } from "./modules/products";
import { cartRoutes } from "./modules/cart";
import { orderRoutes } from "./modules/orders";
import { adminRoutes } from "./modules/admin";

const port = Number(process.env.PORT) || 3001;

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  )
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Nexbuy E-Commerce REST API",
          version: "1.0.0",
          description: "High-performance E-Commerce MVP API powered by Elysia.js, Bun, PostgreSQL & Prisma.",
        },
        tags: [
          { name: "Auth", description: "Authentication & User Session Management" },
          { name: "Products", description: "Public Product Catalog & Categories" },
          { name: "Cart", description: "Customer Shopping Cart" },
          { name: "Orders", description: "Checkout & Order Fulfillment" },
          { name: "Admin", description: "Store Administration & Inventory Control" },
        ],
      },
    })
  )
  .onError(({ code, error, set }) => {
    console.error(`[API Error] ${code}:`, error);

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message || "Input validation failed",
        },
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: {
          code: "ROUTE_NOT_FOUND",
          message: "The requested route does not exist.",
        },
      };
    }

    set.status = 500;
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
    };
  })
  .get("/", () => ({
    success: true,
    message: "Nexbuy E-Commerce API is running 🚀",
    version: "1.0.0",
    docs: "/swagger",
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .group("/api/v1", (api) =>
    api
      .use(authRoutes)
      .use(productRoutes)
      .use(cartRoutes)
      .use(orderRoutes)
      .use(adminRoutes)
  )
  .use(authRoutes)
  .use(productRoutes)
  .use(cartRoutes)
  .use(orderRoutes)
  .use(adminRoutes)
  .listen(port);

console.log(`🦊 Elysia API is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`);

export type App = typeof app;
