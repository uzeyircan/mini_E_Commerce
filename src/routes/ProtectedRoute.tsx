// src/routes/ProtectedRoute.tsx
import { useEffect, ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

type Props = {
  children: ReactElement;
  role?: "admin" | "user";
  message?: string; // giriş yoksa gösterilecek uyarı
};

export default function ProtectedRoute({ children, role, message }: Props) {
  const { user } = useAuth();
  const loc = useLocation();

  // Giriş yoksa opsiyonel uyarı
  useEffect(() => {
    if (!user && message) {
      alert(message);
    }
  }, [user, message]);

  // Giriş yoksa login'e, geldiği yolu state ile taşı
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  // Rol kısıtı varsa ve tutmuyorsa ana sayfaya
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // Yetkiliyse çocuk bileşeni göster
  return children;
}
