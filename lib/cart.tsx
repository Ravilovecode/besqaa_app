import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth';
import type { CartItem, CartSummary } from './types';

type CartState = {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  setQty: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const emptySummary: CartSummary = {
  subtotal: 0,
  count: 0,
  gst: 0,
  deliveryFee: 0,
  total: 0,
};

const CartContext = createContext<CartState | null>(null);

type CartResponse = { items: CartItem[]; summary: CartSummary };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(emptySummary);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSummary(emptySummary);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<CartResponse>('/cart');
      setItems(res.items);
      setSummary(res.summary);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function apply(res: CartResponse) {
    setItems(res.items);
    setSummary(res.summary);
  }

  const add = async (productId: string, quantity = 1) => {
    apply(await api.post<CartResponse>('/cart/items', { productId, quantity }));
  };
  const setQty = async (productId: string, quantity: number) => {
    apply(await api.put<CartResponse>(`/cart/items/${productId}`, { quantity }));
  };
  const remove = async (productId: string) => {
    apply(await api.del<CartResponse>(`/cart/items/${productId}`));
  };
  const clear = async () => {
    apply(await api.del<CartResponse>('/cart'));
  };

  return (
    <CartContext.Provider
      value={{ items, summary, loading, refresh, add, setQty, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
