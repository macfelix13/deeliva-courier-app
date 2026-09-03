import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  serviceName: string;
  meta: string;
  serviceId: string;
  weightKg: number;
  cover: boolean;
  price: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => setItems((prev) => [...prev, item]), []);
  const removeItem = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const total = useMemo(() => Math.round(items.reduce((s, i) => s + i.price, 0) * 100) / 100, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
