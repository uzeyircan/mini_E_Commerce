// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "./styles/global.css";

import Header from "@/components/Header";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { useAuth } from "@/store/auth";

import Shop from "@/pages/Shop";
import CartPage from "@/pages/Cart";
import ProductDetail from "@/pages/ProductDetail";
import FavoritesPage from "@/pages/Favorites";
import ProfilePage from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import AuthCallback from "@/pages/AuthCallback";
import ResetPassword from "@/pages/ResetPassword";

function NotFound() {
  return <div style={{ padding: 24 }}>Sayfa bulunamadı.</div>;
}

export default function App() {
  const initialize = useAuth((s) => s.initialize);
  const isHydrated = useAuth((s) => s.isHydrated);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auth hidrasyonu tamamlanana kadar ProtectedRoute tetiklenmesin
  if (!isHydrated) {
    return (
      <>
        <Header />
        <div style={{ padding: 24, maxWidth: 1120, margin: "0 auto" }}>
          <p className="muted">Yükleniyor…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        {/* Genel */}
        <Route path="/" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* E-posta doğrulama dönüşü ve şifre sıfırlama sayfaları */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/reset" element={<ResetPassword />} />

        {/* Giriş zorunlu sayfalar */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute message="Sepete erişmek için lütfen önce giriş yapınız.">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Admin (sadece admin rolü görür) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
