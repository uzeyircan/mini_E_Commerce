import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth"; // user id & role için

export type Fav = {
  id?: string; // yerel kullanım için opsiyonel
  product_id: string;
  title?: string;
  price?: number;
  image?: string | null;
  created_at?: string;
};

type FavState = {
  items: Record<string, Fav>; // key: product_id
  loading: boolean;
  fetch: () => Promise<void>;
  add: (f: Fav) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clearLocal: () => void; // logout’ta temizlemek için
};

export const useFavorites = create<FavState>((set, get) => ({
  items: {},
  loading: false,

  // Sadece kendi favorilerini getir (policy bunu zaten garanti ediyor)
  fetch: async () => {
    const { user } = useAuth.getState();
    if (!user) return set({ items: {} });

    set({ loading: true });
    // Not: favori tablosu minimal (user_id, product_id). Ürün bilgilerini ürün tablosundan çekmek istersen JOIN yerine
    // products store’dan zenginleştirebilirsin. Aşağıda sade sorgu:
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id, created_at")
      .order("created_at", { ascending: false });

    set({ loading: false });
    if (error) throw error;

    // Ürün detaylarını ayrı store’dan doldurmak istersen burada map’leyebilirsin (title, price, image vb.)
    const map: Record<string, Fav> = {};
    (data ?? []).forEach((row) => {
      map[row.product_id] = {
        product_id: row.product_id,
        created_at: row.created_at,
      };
    });
    set({ items: map });
  },

  add: async (f) => {
    const { user } = useAuth.getState();
    if (!user) throw new Error("Giriş gerekli");

    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, product_id: f.product_id });
    if (error) throw error;

    set({ items: { ...get().items, [f.product_id]: f } });
  },

  remove: async (productId) => {
    const { user } = useAuth.getState();
    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) throw error;

    const next = { ...get().items };
    delete next[productId];
    set({ items: next });
  },

  clearLocal: () => set({ items: {} }),
}));
