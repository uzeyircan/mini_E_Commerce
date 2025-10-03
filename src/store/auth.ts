import { create } from "zustand";
import { supabase } from "@/lib/supabase";
export type Role = "user" | "admin";
export type User = { id: string; email: string; role: Role };

type AuthState = {
  isHydrated: boolean;
  user: User | null;
  token: string | null;
  refresh: () => Promise<void>;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  completeReset: (newPassword: string) => Promise<void>;
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

async function ensureProfileExists(userId: string, email: string | null) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: userId, email: email ?? null },
      { onConflict: "user_id" }
    );
  if (error) console.warn("[auth] ensureProfileExists:", error);
}

export const useAuth = create<AuthState>((set) => ({
  isHydrated: false,
  user: null,
  token: null,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    const sess = data.session;

    if (!sess) {
      set({ user: null, token: null, isHydrated: true });
    } else {
      await ensureProfileExists(sess.user.id, sess.user.email ?? null);
      const role = await fetchProfileRole(sess.user.id);
      set({
        user: { id: sess.user.id, email: sess.user.email!, role },
        token: sess.access_token ?? null,
        isHydrated: true,
      });
    }

    // Auth state changes (login/logout/refresh token) -> state'i güncel tut
    supabase.auth.onAuthStateChange(async (_ev, session) => {
      if (!session) {
        set({ user: null, token: null, isHydrated: true });
      } else {
        await ensureProfileExists(session.user.id, session.user.email ?? null);
        const role = await fetchProfileRole(session.user.id);
        set({
          user: { id: session.user.id, email: session.user.email!, role },
          token: session.access_token ?? null,
          isHydrated: true,
        });
      }
    });
  },

  refresh: async () => {
    const { data } = await supabase.auth.getSession();
    const sess = data.session;
    if (!sess) {
      return set({ user: null, token: null, isHydrated: true });
    }
    await ensureProfileExists(sess.user.id, sess.user.email ?? null);
    const role = await fetchProfileRole(sess.user.id);
    set({
      user: { id: sess.user.id, email: sess.user.email!, role },
      token: sess.access_token ?? null,
      isHydrated: true,
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
        alert(
          "E-posta doğrulanmamış. Lütfen e-postanı doğrula (Spam klasörünü de kontrol et)."
        );
      } else {
        alert("E-posta veya şifre hatalı.");
      }
      return;
    }

    const sUser = data.user!;
    await ensureProfileExists(sUser.id, sUser.email ?? null);
    const role = await fetchProfileRole(sUser.id);
    set({
      user: { id: sUser.id, email: sUser.email!, role },
      token: data.session?.access_token ?? null,
    });
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
        alert("Bu e-posta zaten kayıtlı. Lütfen giriş yapın.");
      } else {
        alert(error.message || "Kayıt sırasında bir hata oluştu.");
      }
      return;
    }

    // Çoğu akışta session olmayabilir (email doğrulama gerekir)
    if (!data.session) {
      alert("Kayıt başarılı. Lütfen e-postanı doğruladıktan sonra giriş yap.");
      return;
    }

    const sUser = data.user!;
    await ensureProfileExists(sUser.id, sUser.email ?? null);
    const role = await fetchProfileRole(sUser.id);
    set({
      user: { id: sUser.id, email: sUser.email!, role },
      token: data.session?.access_token ?? null,
    });
  },

  sendResetEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) {
      alert(error.message || "Şifre sıfırlama e-postası gönderilemedi.");
      return;
    }
    alert("Şifre sıfırlama bağlantısı e-postanıza gönderildi.");
  },

  completeReset: async (newPassword) => {
    // URL'den kodu al
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");
    if (!authCode) {
      alert("Şifre sıfırlama kodu bulunamadı.");
      return;
    }

    // Kodla oturum aç (session oluşur)
    await supabase.auth.exchangeCodeForSession(authCode).catch(() => {});

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      alert(error.message || "Şifre güncellenemedi.");
      return;
    }

    const sUser = data.user!;
    await ensureProfileExists(sUser.id, sUser.email ?? null);
    const role = await fetchProfileRole(sUser.id);

    // Güncel session'ı tekrar çekip token'ı alalım
    const sessRes = await supabase.auth.getSession();
    const token = sessRes.data.session?.access_token ?? null;

    set({
      user: { id: sUser.id, email: sUser.email!, role },
      token,
    });
    alert("Şifreniz güncellendi. Giriş yapabilirsiniz.");
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, token: null, isHydrated: true });
  },
}));

/** API istekleri için senkron token getter **/
export const getToken = (): string | null => {
  return useAuth.getState().token;
};
