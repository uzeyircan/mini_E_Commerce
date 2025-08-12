<<<<<<< HEAD
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

=======

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: "admin" | "user"; }) {
  const { user } = useAuth();
  const loc = useLocation();

>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
