
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: "admin" | "user"; }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
