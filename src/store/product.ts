// src/store/product.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  stock?: number | null;
  description?: string | null;
  category_id?: string | null;
  category_name?: string | null; // JOIN doldurur
};

type State = {
  items: Product[];
  fetch: () => Promise<void>;
  add: (p: Omit<Product, "id">) => Promise<void>;
  update: (id: string, p: Partial<Product>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

// Supabase satırını tipimize dönüştürmek için küçük yardımcı
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    image: row.image ?? null,
    stock: row.stock ?? null,
    description: row.description ?? null,
    category_id: row.category_id ?? null,
    category_name: row.categories?.name ?? null, // ilişkiden gelen ad
  };
}

// Ürüne yazılabilir alanları süzen yardımcı (DB insert/update için)
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

  // Ürünleri kategori ile beraber çek
  fetch: async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, title, price, image, stock, description, category_id,
        categories ( name )
      `)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const items = (data ?? []).map(mapRowToProduct);
    set({ items });
  },

  // Ürün ekle (category_id dahil), eklenen kaydı JOIN ile geri al
  add: async (p) => {
    const payload = toWritable(p);

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select(`
        id, title, price, image, stock, description, category_id,
        categories ( name )
      `)
      .single();

    if (error) throw error;

    const inserted = mapRowToProduct(data);
    set({ items: [inserted, ...get().items] });
  },

  // Ürün güncelle (category_id dahil), güncellenen kaydı JOIN ile geri al
  update: async (id, p) => {
    const payload = toWritable(p);

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select(`
        id, title, price, image, stock, description, category_id,
        categories ( name )
      `)
      .single();

    if (error) throw error;

    const updated = mapRowToProduct(data);
    set({
      items: get().items.map((x) => (x.id === id ? updated : x)),
    });
  },

  remove: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    set({ items: get().items.filter((x) => x.id !== id) });
  },
}));
