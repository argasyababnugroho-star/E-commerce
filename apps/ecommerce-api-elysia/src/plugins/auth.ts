import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "database";

export interface AuthUser {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

const JWT_SECRET = process.env.JWT_SECRET || "ecommerce_mvp_jwt_secret_key_minimum_32_characters_super_secret";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: "7d",
    })
  )
  .derive({ as: "scoped" }, async ({ jwt, cookie, headers }): Promise<{ user: AuthUser | null }> => {
    // 1. Try cookie
    const tokenFromCookie = cookie.auth_token?.value;
    
    // 2. Try Authorization header
    const authHeader = headers["authorization"];
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    const token = tokenFromCookie || tokenFromHeader;
    if (!token) {
      return { user: null };
    }

    try {
      const payload = await jwt.verify(token);
      if (!payload || typeof payload !== "object" || !("id" in payload)) {
        return { user: null };
      }

      return {
        user: {
          id: String(payload.id),
          email: String(payload.email),
          role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
        },
      };
    } catch {
      return { user: null };
    }
  });

export function requireAuth(user: AuthUser | null, set: { status?: number | string }) {
  if (!user) {
    set.status = 401;
    throw {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Otentikasi diperlukan untuk mengakses rute ini",
      },
    };
  }
  return user;
}

export function requireAdmin(user: AuthUser | null, set: { status?: number | string }) {
  const authed = requireAuth(user, set);
  if (authed.role !== "ADMIN") {
    set.status = 403;
    throw {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Hanya Administrator yang memiliki akses ke sumber daya ini",
      },
    };
  }
  return authed;
}
