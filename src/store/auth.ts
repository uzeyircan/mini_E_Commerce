
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "user" | "admin";
type User = { id: string; email: string; role: Role };

type AuthState = {
  user: User | null;
  token: string | null;
  login: (u: User, t: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (u, t) => set({ user: u, token: t }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "auth-store" }
  )
);
