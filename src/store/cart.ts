
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { id: string; title: string; price: number; qty: number };

type CartState = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      add: (item, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.id === item.id);
        if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
        else items.push({ ...item, qty });
        const count = items.reduce((s, i) => s + i.qty, 0);
        set({ items, count });
      },
      remove: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        const count = items.reduce((s, i) => s + i.qty, 0);
        set({ items, count });
      },
      clear: () => set({ items: [], count: 0 }),
    }),
    { name: "cart-store" }
  )
);
