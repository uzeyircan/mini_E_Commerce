import { NavLink, Route, Routes } from "react-router-dom";
import ProductsPage from "@/pages/Products";
import CartPage from "@/pages/Cart";
import AdminProductsPage from "@/pages/AdminProducts";
import LoginPage from "@/pages/Login";
import { useAuth } from "@/store/auth";
import "./styles.css";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <LoginPage />;
}

function AuthButtons() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="row" style={{ gap: 8 }}>
      <span className="badge">{user.email}</span>
      <button className="btn ghost" onClick={logout}>
        Çıkış
      </button>
    </div>
  );
}

export default function App() {
  return (
    <>
      <header className="nav container">
        <div className="brand">
          <span className="dot"></span> Mini E-Commerce
        </div>
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Ürünler
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Sepet
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Admin
          </NavLink>
          <AuthButtons />
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminProductsPage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
      </Routes>

      <footer className="container">
        <div className="muted">
          Demo • React + Vite + TS + Zustand + Supabase
        </div>
      </footer>
    </>
  );
}
