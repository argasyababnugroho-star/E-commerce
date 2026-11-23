import { Elysia, t } from "elysia";
import { prisma } from "database";
import { authPlugin, requireAuth } from "../plugins/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .post(
    "/register",
    async ({ body, jwt, cookie, set }) => {
      const { fullName, email, password, phone } = body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
          },
        };
      }

      if (password.length < 8) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "PASSWORD_TOO_SHORT",
            message: "Password minimal 8 karakter.",
          },
        };
      }

      const passwordHash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10,
      });

      const user = await prisma.user.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          passwordHash,
          phone: phone || null,
          role: "CUSTOMER",
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });

      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      cookie.auth_token.set({
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });

      set.status = 201;
      return {
        success: true,
        data: user,
        message: "Registrasi akun berhasil",
      };
    },
    {
      body: t.Object({
        fullName: t.String({ minLength: 2, maxLength: 150 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        phone: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, jwt, cookie, set }) => {
      const { email, password } = body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email atau password yang Anda masukkan salah.",
          },
        };
      }

      const isMatch = await Bun.password.verify(password, user.passwordHash);
      if (!isMatch) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email atau password yang Anda masukkan salah.",
          },
        };
      }

      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      cookie.auth_token.set({
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        message: "Login berhasil",
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post("/logout", async ({ cookie }) => {
    cookie.auth_token.remove();
    return {
      success: true,
      message: "Berhasil logout",
    };
  })
  .get("/me", async ({ user, set }) => {
    const authed = requireAuth(user, set);

    const profile = await prisma.user.findUnique({
      where: { id: authed.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!profile) {
      set.status = 404;
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "User tidak ditemukan" },
      };
    }

    return {
      success: true,
      data: profile,
    };
  });
