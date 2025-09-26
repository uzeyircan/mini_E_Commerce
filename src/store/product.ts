// src/store/product.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  stock?: number | null;
  description?: string | null;
  category_id?: string | null;
  category_name?: string | null; // JOIN ile doldurulur (categories.name)
};

type State = {
  items: Product[];
  fetch: () => Promise<void>;
  add: (p: Omit<Product, "id">) => Promise<void>;
  update: (id: string, p: Partial<Product>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  decrementStockBulk: (
    pairs: Array<{ id: string; qty: number }>
  ) => Promise<void>;
};

// Supabase satırını tipimize dönüştür
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    image: row.image ?? null,
    stock: row.stock ?? null,
    description: row.description ?? null,
    category_id: row.category_id ?? null,
    category_name: row.categories?.name ?? null,
  };
}

// DB'ye yazılabilir alanları süz
function toWritable(p: Partial<Product>) {
  return {
    title: p.title,
    price: p.price,
    image: p.image ?? null,
    stock: p.stock ?? null,
    description: p.description ?? null,
    category_id: p.category_id ?? null,
  };
}

export const useProducts = create<State>((set, get) => ({
  items: [],

  // Ürünleri kategori adıyla birlikte getir
  fetch: async () => {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id, title, price, image, stock, description, category_id,
        categories ( name )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    set({ items: (data ?? []).map(mapRowToProduct) });
  },

  // Ürün ekle (yalnızca yazılabilir alanları gönder) ve eklenen kaydı JOIN ile çek
  add: async (p) => {
    const payload = toWritable(p); // ⬅️ önemli: p değil payload gönder
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select(
        `
        id, title, price, image, stock, description, category_id,
        categories ( name )
      `
      )
      .maybeSingle(); // bazı ortamlarda satır dönmeyebilir

    if (error) throw error;

    if (data) {
      const inserted = mapRowToProduct(data);
      set({ items: [inserted, ...get().items] });
    } else {
      // temkinli senkronizasyon
      await get().fetch();
    }
  },

  // Ürün güncelle ve güncellenen kaydı JOIN ile geri al
  update: async (id, p) => {
    const payload = toWritable(p);
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select(
        `
        id, title, price, image, stock, description, category_id,
        categories ( name )
      `
      )
      .maybeSingle(); // .single() yerine .maybeSingle() daha güvenli

    if (error) throw error;

    if (data) {
      const updated = mapRowToProduct(data);
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) });
    } else {
      await get().fetch();
    }
  },

  remove: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    set({ items: get().items.filter((x) => x.id !== id) });
  },
  decrementStockBulk: async (pairs: Array<{ id: string; qty: number }>) => {
    for (const { id, qty } of pairs) {
      const { error } = await supabase.rpc("decrement_stock", {
        pid: id,
        pqty: qty,
      });
      if (error) throw error as PostgrestError;
    }
    // listeyi tazele
    await get().fetch();
  },
}));
