import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";

export type Comment = {
  id: string;
  product_id: string;
  author_id: string;
  author_email?: string; // frontend doldurabilir
  author_name?: string; // frontend doldurabilir
  text: string;
  created_at: string;
  updated_at?: string | null;
};

type CState = {
  // productId -> comments[]
  items: Record<string, Comment[]>;
  loading: boolean;
  fetch: (productId: string) => Promise<void>;
  add: (productId: string, text: string) => Promise<void>;
  update: (productId: string, id: string, text: string) => Promise<void>;
  remove: (productId: string, id: string) => Promise<void>;
  clearLocal: () => void;
};

export const useComments = create<CState>((set, get) => ({
  items: {},
  loading: false,

  fetch: async (productId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    set({ loading: false });
    if (error) throw error;

    set((s) => ({
      items: { ...s.items, [productId]: (data as Comment[]) ?? [] },
    }));
  },

  add: async (productId, text) => {
    const { user } = useAuth.getState();
    if (!user) throw new Error("Giriş gerekli");

    const { data, error } = await supabase
      .from("comments")
      .insert({
        product_id: productId,
        author_id: user.id, // policy: author_id = auth.uid() olmalı
        text: text.trim(),
      })
      .select("*")
      .single();

    if (error) throw error;

    set((s) => {
      const arr = s.items[productId]
        ? [data as Comment, ...s.items[productId]]
        : [data as Comment];
      return { items: { ...s.items, [productId]: arr } };
    });
  },

  update: async (productId, id, text) => {
    const { data, error } = await supabase
      .from("comments")
      .update({ text: text.trim(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("product_id", productId)
      .select("*")
      .single();

    if (error) throw error;

    set((s) => {
      const arr = s.items[productId] ? [...s.items[productId]] : [];
      const idx = arr.findIndex((x) => x.id === id);
      if (idx >= 0) arr[idx] = data as Comment;
      return { items: { ...s.items, [productId]: arr } };
    });
  },

  remove: async (productId, id) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)
      .eq("product_id", productId);
    if (error) throw error;

    set((s) => {
      const arr = s.items[productId]?.filter((x) => x.id !== id) ?? [];
      return { items: { ...s.items, [productId]: arr } };
    });
  },

  clearLocal: () => set({ items: {} }),
}));
