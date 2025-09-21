import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export function RequireAuth() {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return null; // istersen loader koy
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RequireAdmin() {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
