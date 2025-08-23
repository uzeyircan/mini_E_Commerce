import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Role = "user" | "admin";
export type User = { id: string; email: string; role: Role };

type AuthState = {
  user: User | null;
  loadSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,

  loadSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      set({ user: null });
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    set({
      user: {
        id: session.user.id,
        email: session.user.email || "",
        role: (prof?.role as Role) ?? "user",
      },
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    set({
      user: {
        id: data.user.id,
        email: data.user.email || "",
        role: (prof?.role as Role) ?? "user",
      },
    });
  },

  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Varsayılan profil oluştur
    await supabase
      .from("profiles")
      .insert({ user_id: data.user!.id, role: "user" });

    set({
      user: { id: data.user!.id, email: data.user!.email || "", role: "user" },
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

/** Mevcut Supabase session'dan access token'ı getirir (yoksa null). */
export async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
