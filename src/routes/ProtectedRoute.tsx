import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  role,
  message,
}: {
  children: JSX.Element;
  role?: "admin" | "user";
  message?: string;
}) {
  const { user } = useAuth();
  const loc = useLocation();

  useEffect(() => {
    if (!user && message) {
      // basit uyarı; isterseniz toast kütüphanesine bağlarız
      alert(message);
    }
  }, [user, message]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
