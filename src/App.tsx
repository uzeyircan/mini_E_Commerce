import { Routes, Route } from "react-router-dom";
import "./styles/global.css";
import Header from "@/components/Header";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import Shop from "@/pages/Shop";
import CartPage from "@/pages/Cart";
import ProductDetail from "@/pages/ProductDetail";

function NotFound() {
  return <div style={{ padding: 24 }}>Sayfa bulunamadı.</div>;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute message="Sepete erişmek için lütfen önce kayıt olunuz.">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
