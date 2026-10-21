/**
 * API client for communicating with the Elysia.js backend.
 * Base URL dari environment variable NEXT_PUBLIC_API_URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorBody?.error?.message ?? errorBody?.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ──────────────────────────────
// Auth
// ──────────────────────────────
export const authApi = {
  register: (body: { email: string; password: string; fullName: string; phone?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: (token: string) =>
    request("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
};

// ──────────────────────────────
// Products
// ──────────────────────────────
export const productsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => request("/products", { params: params as Record<string, string | number | boolean | undefined | null> }),

  getBySlug: (slug: string) => request(`/products/${slug}`),
};

// ──────────────────────────────
// Categories
// ──────────────────────────────
export const categoriesApi = {
  list: () => request("/categories"),
};

// ──────────────────────────────
// Cart
// ──────────────────────────────
export const cartApi = {
  get: (token: string) =>
    request("/cart", { headers: { Authorization: `Bearer ${token}` } }),

  add: (token: string, body: { productId: string; quantity: number }) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (token: string, itemId: string, quantity: number) =>
    request(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  remove: (token: string, itemId: string) =>
    request(`/cart/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ──────────────────────────────
// Orders
// ──────────────────────────────
export const ordersApi = {
  list: (token: string) =>
    request("/orders", { headers: { Authorization: `Bearer ${token}` } }),

  getById: (token: string, id: string) =>
    request(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  create: (token: string, body: {
    addressId: string;
    paymentMethod: string;
    notes?: string;
  }) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
