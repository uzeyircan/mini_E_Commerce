import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Comment = {
  id: string;
  productId: string;
  authorEmail: string;
  authorName?: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
};

type State = {
  items: Record<string, Comment[]>; // productId -> comments
  add: (c: Omit<Comment, "id" | "createdAt" | "updatedAt">) => void;
  update: (productId: string, id: string, text: string) => void;
  remove: (productId: string, id: string) => void;
};

export const useComments = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      add: (c) =>
        set((s) => {
          const arr = s.items[c.productId] ? [...s.items[c.productId]] : [];
          arr.unshift({
            ...c,
            id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
            createdAt: Date.now(),
          });
          return { items: { ...s.items, [c.productId]: arr } };
        }),
      update: (productId, id, text) =>
        set((s) => {
          const arr = s.items[productId] ? [...s.items[productId]] : [];
          const idx = arr.findIndex((x) => x.id === id);
          if (idx >= 0) arr[idx] = { ...arr[idx], text, updatedAt: Date.now() };
          return { items: { ...s.items, [productId]: arr } };
        }),
      remove: (productId, id) =>
        set((s) => {
          const arr = s.items[productId]?.filter((x) => x.id !== id) ?? [];
          return { items: { ...s.items, [productId]: arr } };
        }),
    }),
    { name: "comments-store" }
  )
);
