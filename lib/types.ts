export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
};

export type Spec = { label: string; value: string };

export type Product = {
  _id: string;
  name: string;
  description?: string;
  category: Category | string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  stock: number;
  brand?: string;
  rating: number;
  reviewCount: number;
  specs: Spec[];
  shipsInDays: number;
  isDeal: boolean;
  isRecommended: boolean;
  discountPercent?: number;
};

export type Address = {
  _id?: string;
  label?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  isDefault?: boolean;
};

export type BuybackEntry = {
  _id?: string;
  date: string;
  amount: number;
};

export type User = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  gstVerified?: boolean;
  avatarUrl?: string;
  addresses: Address[];
  savedProducts?: string[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  buybacks?: BuybackEntry[];
  // Legacy single-entry mirror (next upcoming buyback).
  buybackDate?: string;
  buybackAmount?: number;
};

// Returned by register (and login when the account isn't verified yet).
export type PendingVerification = {
  requiresVerification: true;
  pendingId: string;
  email: string; // '' for phone-only accounts
  phone: string;
  message?: string;
  devOtps?: { email?: string; phone: string };
};

export type CartItem = { product: Product; quantity: number };

export type CartSummary = {
  subtotal: number;
  count: number;
  gst: number;
  deliveryFee: number;
  total: number;
};

export type Order = {
  _id: string;
  orderNumber: string;
  items: { name: string; image?: string; price: number; quantity: number }[];
  subtotal: number;
  gst: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus?: string;
  paymentProofUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
};
