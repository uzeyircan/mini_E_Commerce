import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type Role = "user" | "admin";
type User = { id: string; email: string; role: Role };

type AuthState = {
  isHydrated: any;
  user: User | null;
  
  // yeni: init ve auth state dinleyicisi
  initialize: () => Promise<void>;
  // mevcut action'ların
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

async function fetchProfileRole(userId: string): Promise<Role> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return (data?.role as Role) ?? "user";
}

export const useAuth = create<AuthState>((set) => ({
  isHydrated: false,
  user: null,

  initialize: async () => {
    // 1) Mevcut session’ı oku
    const { data } = await supabase.auth.getSession();
    const sess = data.session;
    if (!sess) {
      set({ user: null, isHydrated: true });
    } else {
      const role = await fetchProfileRole(sess.user.id);
      set({
        user: { id: sess.user.id, email: sess.user.email!, role },
        isHydrated: true,
      });
    }

    // 2) Sonradan oturum değişirse store’u güncelle
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        set({ user: null, isHydrated: true });
      } else {
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
    email: email.trim(),   // boşlukları temizle
    password,
  });

  if (error) {
    const msg = error.message || "Giriş yapılamadı.";
    if (msg.toLowerCase().includes("Mail onaylanmadı")) {
      alert("E-posta doğrulanmamış. Lütfen mail kutunu kontrol et.");
    } else {
      alert("E-posta veya şifre hatalı.");
    }
    return;
  }

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
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    // Eğer eposta zaten kayıtlı ise
    if (error.message.toLowerCase().includes("already registered")) {
      alert("Bu e-posta ile zaten kayıt yapılmış. Lütfen giriş yapmayı deneyin.");
      return;
    }

    // Diğer hatalar
    alert(error.message || "Kayıt sırasında bir hata oluştu.");
    return;
  }

  // Eğer kayıt oldu ama e-posta doğrulama gerekiyor ise
  if (!data.session) {
    alert("Kayıt başarılı. Lütfen e-postanı doğruladıktan sonra giriş yap.");
    return;
  }

  // Profil tablosuna kullanıcı rolü kaydet
  await supabase.from("profiles").insert({
    user_id: data.user!.id,
    role: "user",
  });

  set({
    user: {
      id: data.user!.id,
      email: data.user!.email!,
      role: "user",
    },
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
