// store/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

// Sepete dışarıdan gelecek payload: qty hariç her şey (image dahil)
type CartItemInput = Omit<CartItem, "qty">;

type CartState = {
  items: CartItem[];
  count: number;
  add: (item: CartItemInput, qty?: number) => void;
  addToCart: (item: CartItemInput) => void;
  setQty: (id: string, qty: number) => void;
  increase: (id: string, delta?: number) => void;
  decrease: (id: string, delta?: number) => void;
  remove: (id: string) => void;
  removeMany: (ids: string[]) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => {
      const recalc = (items: CartItem[]) =>
        items.reduce((s, i) => s + i.qty, 0);

      return {
        items: [],
        count: 0,

        add: (item, qty = 1) => {
          const items = [...get().items];
          const idx = items.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
          } else {
            // item: { id, title, price, image } -> CartItem haline getir
            items.push({ ...item, qty });
          }
          set({ items, count: recalc(items) });
        },

        addToCart: (item) => {
          get().add(item, 1);
        },

        setQty: (id, qty) => {
          let items = [...get().items];
          const idx = items.findIndex((i) => i.id === id);
          if (idx === -1) return;
          if (qty <= 0) items = items.filter((i) => i.id !== id);
          else items[idx] = { ...items[idx], qty };
          set({ items, count: recalc(items) });
        },

        increase: (id, delta = 1) => {
          const items = get().items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + delta } : i
          );
          set({ items, count: recalc(items) });
        },

        decrease: (id, delta = 1) => {
          const items = get()
            .items.map((i) => (i.id === id ? { ...i, qty: i.qty - delta } : i))
            .filter((i) => i.qty > 0);
          set({ items, count: recalc(items) });
        },

        remove: (id) => {
          const items = get().items.filter((i) => i.id !== id);
          set({ items, count: recalc(items) });
        },

        removeMany: (ids) => {
          const toRemove = new Set(ids);
          const items = get().items.filter((i) => !toRemove.has(i.id));
          set({ items, count: recalc(items) });
        },

        clear: () => set({ items: [], count: 0 }),
      };
    },
    { name: "cart-store" }
  )
);
