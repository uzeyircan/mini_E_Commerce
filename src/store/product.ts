import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  stock?: number;
  description?: string;
};

type ProductState = {
  items: Product[];
  add: (p: Omit<Product, "id">) => void;
  update: (id: string, p: Partial<Omit<Product, "id">>) => void;
  remove: (id: string) => void;
};

export const useProducts = create<ProductState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => ({
          items: [{ id: crypto.randomUUID(), ...p }, ...s.items],
        })),
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
    }),
    { name: "product-store" }
  )
);
