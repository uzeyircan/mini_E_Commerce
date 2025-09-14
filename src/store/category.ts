import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Category = {
  id: string;
  name: string;
};

type State = {
  items: Record<string, Category>;         // id → Category
  byName: Record<string, string>;          // lower(name) → id
  fetch: () => Promise<void>;
  ensureByName: (name: string) => Promise<string>; // yoksa oluştur, id döner
};

export const useCategories = create<State>((set, get) => ({
  items: {},
  byName: {},

  fetch: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    const items: Record<string, Category> = {};
    const byName: Record<string, string> = {};
    (data ?? []).forEach((c) => {
      items[c.id] = { id: c.id, name: c.name };
      byName[c.name.toLowerCase().trim()] = c.id;
    });
    set({ items, byName });
  },

  ensureByName: async (rawName: string) => {
    const name = rawName.trim();
    if (!name) throw new Error("Kategori adı boş olamaz.");
    const k = name.toLowerCase();

    const { byName } = get();
    if (byName[k]) return byName[k];

    // DB'de var mı diye kontrol (case-insensitive)
    {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .ilike("name", name)
        .limit(1);
      if (error) throw error;
      const found = data?.[0];
      if (found) {
        set((s) => ({
          items: { ...s.items, [found.id]: found },
          byName: { ...s.byName, [found.name.toLowerCase().trim()]: found.id },
        }));
        return found.id;
      }
    }

    // Yoksa oluştur
    const { data: inserted, error: insErr } = await supabase
      .from("categories")
      .insert({ name })
      .select("*")
      .single();
    if (insErr) throw insErr;

    set((s) => ({
      items: { ...s.items, [inserted.id]: inserted },
      byName: { ...s.byName, [inserted.name.toLowerCase().trim()]: inserted.id },
    }));

    return inserted.id;
  },
}));
