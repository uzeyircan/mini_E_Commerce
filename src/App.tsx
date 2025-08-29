import { Routes, Route } from "react-router-dom";
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
import { useEffect } from "react";

function NotFound() {
  return <div style={{ padding: 24 }}>Sayfa bulunamadı.</div>;
}

export default function App() {
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    initialize(); // sayfa yenilense bile kullanıcıyı tekrar yükler
  }, [initialize]);

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* Ürün listesi */}
        <Route path="/" element={<Shop />} />

        {/* Ürün detay */}
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Sepet (giriş zorunlu) */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute message="Sepete erişmek için lütfen önce giriş yapınız.">
              <CartPage />
            </ProtectedRoute>
          }
        />

        {/* Favoriler (giriş zorunlu) */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin (rol: admin) */}
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
