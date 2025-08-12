import { create } from "zustand";
import { persist } from "zustand/middleware";

<<<<<<< HEAD
export type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};
=======
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { id: string; title: string; price: number; qty: number };
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448

type CartState = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
<<<<<<< HEAD
  setQty: (id: string, qty: number) => void;
  increase: (id: string, delta?: number) => void;
  decrease: (id: string, delta?: number) => void;
  remove: (id: string) => void;
  removeMany: (ids: string[]) => void;
=======
  remove: (id: string) => void;
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
<<<<<<< HEAD
    (set, get) => {
      const recalc = (items: CartItem[]) =>
        items.reduce((s, i) => s + i.qty, 0);

      return {
        items: [],
        count: 0,

        add: (item, qty = 1) => {
          const items = [...get().items];
          const idx = items.findIndex((i) => i.id === item.id);
          if (idx >= 0)
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
          else items.push({ ...item, qty });
          set({ items, count: recalc(items) });
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
          let items = get()
            .items.map((i) => (i.id === id ? { ...i, qty: i.qty - delta } : i))
            .filter((i) => i.qty > 0);
          set({ items, count: recalc(items) });
        },

        remove: (id) => {
          const items = get().items.filter((i) => i.id !== id);
          set({ items, count: recalc(items) });
        },

        removeMany: (ids) => {
          const setIds = new Set(ids);
          const items = get().items.filter((i) => !setIds.has(i.id));
          set({ items, count: recalc(items) });
        },

        clear: () => set({ items: [], count: 0 }),
      };
    },
=======
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
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
    { name: "cart-store" }
  )
);
