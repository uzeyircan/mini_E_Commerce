import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";

export type CartItem = {
  product_id: string;
  title?: string;
  price?: number;
  qty: number;
  updated_at?: string;
};

type CartState = {
  items: CartItem[];
  count: number; // toplam adet
  loading: boolean;

  fetch: () => Promise<void>;

  add: (
    product: { id: string; title?: string; price?: number },
    qty?: number
  ) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  increase: (productId: string, delta?: number) => Promise<void>;
  decrease: (productId: string, delta?: number) => Promise<void>;

  remove: (productId: string) => Promise<void>;
  removeMany: (ids: string[]) => Promise<void>;
  clearLocal: () => void; // logout’ta temizlemek için
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  count: 0,
  loading: false,

  fetch: async () => {
    const { user } = useAuth.getState();
    if (!user) return set({ items: [], count: 0 });

    set({ loading: true });
    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, qty, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    set({ loading: false });
    if (error) throw error;

    const items = (data ?? []).map((r) => ({
      product_id: r.product_id,
      qty: r.qty,
      updated_at: r.updated_at,
    }));
    const count = items.reduce((s, i) => s + i.qty, 0);
    set({ items, count });
  },

  add: async (product, qty = 1) => {
    const { user } = useAuth.getState();
    if (!user) throw new Error("Giriş gerekli");

    // upsert: varsa güncelle (qty arttır), yoksa ekle
    const existing = get().items.find((i) => i.product_id === product.id);
    const newQty = (existing?.qty ?? 0) + qty;

    const { error } = await supabase
      .from("cart_items")
      .upsert(
        { user_id: user.id, product_id: product.id, qty: newQty },
        { onConflict: "user_id,product_id" }
      );
    if (error) throw error;

    // yereli güncelle
    const items = existing
      ? get().items.map((i) =>
          i.product_id === product.id ? { ...i, qty: newQty } : i
        )
      : [{ product_id: product.id, qty: newQty }, ...get().items];

    const count = items.reduce((s, i) => s + i.qty, 0);
    set({ items, count });
  },

  setQty: async (productId, qty) => {
    const { user } = useAuth.getState();
    if (!user) throw new Error("Giriş gerekli");

    if (qty <= 0) {
      await get().remove(productId);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ qty })
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) throw error;

    const items = get().items.map((i) =>
      i.product_id === productId ? { ...i, qty } : i
    );
    const count = items.reduce((s, i) => s + i.qty, 0);
    set({ items, count });
  },

  increase: async (productId, delta = 1) => {
    const curr = get().items.find((i) => i.product_id === productId)?.qty ?? 0;
    await get().setQty(productId, curr + delta);
  },

  decrease: async (productId, delta = 1) => {
    const curr = get().items.find((i) => i.product_id === productId)?.qty ?? 0;
    await get().setQty(productId, curr - delta);
  },

  remove: async (productId) => {
    const { user } = useAuth.getState();
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) throw error;

    const items = get().items.filter((i) => i.product_id !== productId);
    const count = items.reduce((s, i) => s + i.qty, 0);
    set({ items, count });
  },

  removeMany: async (ids) => {
    const { user } = useAuth.getState();
    if (!user) return;
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .in("product_id", ids);
    if (error) throw error;

    const setIds = new Set(ids);
    const items = get().items.filter((i) => !setIds.has(i.product_id));
    const count = items.reduce((s, i) => s + i.qty, 0);
    set({ items, count });
  },

  clearLocal: () => set({ items: [], count: 0 }),
}));
