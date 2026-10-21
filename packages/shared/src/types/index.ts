import type { OrderStatus, UserRole, PaymentMethod } from "../constants/index.ts";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  primaryImage?: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  imageUrl?: string;
  quantity: number;
  currentStock: number;
  subtotal: number;
}

export interface CartSummaryDto {
  items: CartItemDto[];
  totalQuantity: number;
  totalAmount: number;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddressDto {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province?: string;
  postalCode: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddressDto;
  trackingNumber?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  items: OrderItemDto[];
}
