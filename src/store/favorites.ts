import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Fav {
  id: string;
  title: string;
  price: number;
  image?: string;
}

interface FavState {
  items: Record<string, Fav>;
  add: (fav: Fav) => void;
  remove: (id: string) => void;
}

export const useFavorites = create<FavState>()(
  persist(
    (set) => ({
      items: {},
      add: (fav) =>
        set((state) => ({
          items: { ...state.items, [fav.id]: fav },
        })),
      remove: (id) =>
        set((state) => {
          const next = { ...state.items };
          delete next[id];
          return { items: next };
        }),
    }),
    { name: "favorites-store" }
  )
);
