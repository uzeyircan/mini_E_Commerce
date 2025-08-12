<<<<<<< HEAD
import Shop from "@/pages/Shop";
import { Routes, Route } from "react-router-dom";
import "./styles/global.css";
import Header from "@/components/Header";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import CartPage from "@/pages/Cart";

function NotFound() {
  return <div style={{ padding: 24 }}>Sayfa bulunamadı.</div>;
=======

import "./styles/global.css";
import Header from "@/components/Header";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function HomePage() {
  return (
    <div style={{maxWidth:1120, margin:"24px auto", padding:"0 16px"}}>
      <h1>Mağaza</h1>
      <p>Ürünler burada listelenecek.</p>
    </div>
  );
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
}
function CartPage() {
  return (
    <div style={{maxWidth:1120, margin:"24px auto", padding:"0 16px"}}>
      <h1>Sepet</h1>
      <p>Sepet sayfası.</p>
    </div>
  );
}
function NotFound() {
  return <div style={{padding:24}}>Sayfa bulunamadı.</div>;
}

export default function App() {
  return (
<<<<<<< HEAD
    <>
      <Header />
      <Routes>
        <Route
          path="/cart"
          element={
            <ProtectedRoute message="Sepete erişmek için lütfen önce kayıt olunuz.">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Shop />} />
        <Route path="/Login" element={<Login />} />
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
=======
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/cart" element={<CartPage/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard/>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </BrowserRouter>
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
  );
}
