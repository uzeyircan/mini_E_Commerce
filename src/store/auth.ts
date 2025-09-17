// src/store/auth.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type Role = "user" | "admin";
type User = { id: string; email: string; role: Role };

type AuthState = {
  isHydrated: boolean;
  user: User | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

async function fetchProfileRole(userId: string): Promise<Role> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[auth] fetchProfileRole:", error);
    return "user";
  }
  const raw = (data?.role ?? "user").toString().trim().toLowerCase();
  return raw === "admin" ? "admin" : "user";
}

// Profil satırını garanti altına al (yoksa oluştur)
async function ensureProfileExists(userId: string, email: string | null) {
  const { error } = await supabase.from("profiles").upsert(
    { user_id: userId, email: email ?? null }, // ✅ user_id
    { onConflict: "user_id" } // ✅ user_id
  );
  if (error) console.warn("[auth] ensureProfileExists:", error);
}

export const useAuth = create<AuthState>((set) => ({
  isHydrated: false,
  user: null,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    const sess = data.session;

    if (!sess) {
      set({ user: null, isHydrated: true });
    } else {
      await ensureProfileExists(sess.user.id, sess.user.email ?? null);
      const role = await fetchProfileRole(sess.user.id);
      set({
        user: { id: sess.user.id, email: sess.user.email!, role },
        isHydrated: true,
      });
    }

    supabase.auth.onAuthStateChange(async (_ev, session) => {
      if (!session) {
        set({ user: null, isHydrated: true });
      } else {
        await ensureProfileExists(session.user.id, session.user.email ?? null);
        const role = await fetchProfileRole(session.user.id);
        set({
          user: { id: session.user.id, email: session.user.email!, role },
          isHydrated: true,
        });
      }
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const raw = (error.message || "").toLowerCase();
      if (raw.includes("confirm")) {
        alert("E-posta doğrulanmamış. Lütfen e-postanı doğrula.");
      } else {
        alert("E-posta veya şifre hatalı.");
      }
      return;
    }

    const sUser = data.user;
    await ensureProfileExists(sUser.id, sUser.email ?? null);
    const role = await fetchProfileRole(sUser.id);
    set({ user: { id: sUser.id, email: sUser.email!, role } });
  },

  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      const raw = (error.message || "").toLowerCase();
      if (raw.includes("already") || raw.includes("registered")) {
        alert("Bu e-posta ile zaten kayıt var. Lütfen giriş yapın.");
      } else {
        alert(error.message || "Kayıt sırasında bir hata oluştu.");
      }
      return;
    }

    if (!data.session) {
      alert("Kayıt başarılı. Lütfen e-postanı doğruladıktan sonra giriş yap.");
      return;
    }

    const sUser = data.user!;
    await ensureProfileExists(sUser.id, sUser.email ?? null);
    set({ user: { id: sUser.id, email: sUser.email!, role: "user" } });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

export async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
