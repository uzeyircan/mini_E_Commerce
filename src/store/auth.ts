import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type Role = "user" | "admin";
type User = { id: string; email: string; role: Role };
type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loadSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return set({ user: null });
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();
    set({
      user: {
        id: session.user.id,
        email: session.user.email!,
        role: prof?.role ?? "user",
      },
    });
  },
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // profil oku
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();
    set({
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: prof?.role ?? "user",
      },
    });
  },
  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // profil oluştur (role=user)
    await supabase
      .from("profiles")
      .insert({ user_id: data.user!.id, role: "user" });
    set({
      user: { id: data.user!.id, email: data.user!.email!, role: "user" },
    });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
