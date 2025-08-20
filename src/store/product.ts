import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  stock?: number | null;
  description?: string | null;
};
type State = {
  items: Product[];
  fetch: () => Promise<void>;
  add: (p: Omit<Product, "id">) => Promise<void>;
  update: (id: string, p: Partial<Product>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useProducts = create<State>((set, get) => ({
  items: [],
  fetch: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    set({ items: data as Product[] });
  },
  add: async (p) => {
    const { data, error } = await supabase
      .from("products")
      .insert(p)
      .select("*")
      .single();
    if (error) throw error;
    set({ items: [data as Product, ...get().items] });
  },
  update: async (id, p) => {
    const { data, error } = await supabase
      .from("products")
      .update(p)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    set({
      items: get().items.map((x) => (x.id === id ? (data as Product) : x)),
    });
  },
  remove: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    set({ items: get().items.filter((x) => x.id !== id) });
  },
}));
