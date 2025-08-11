
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import "./header.css";

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link to="/" className="logo">miniCommerce</Link>

        <nav className="nav">
          <NavLink to="/" className="nav__link">Mağaza</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="nav__link">Admin Panel</NavLink>
          )}
        </nav>

        <div className="hdr__right">
          {!user && (
            <div className="auth">
              <Link to="/register" className="btn btn--ghost">Kayıt Ol</Link>
              <Link to="/login" className="btn btn--primary">Giriş Yap</Link>
            </div>
          )}
          {user && (
            <div className="auth auth--in">
              <span className="userchip">{user.email}</span>
              <button className="btn btn--ghost" onClick={logout}>Çıkış</button>
            </div>
          )}

          <Link to="/cart" className="cart" aria-label="Sepet">
            <svg className="cart__icon" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 20h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 16h6.55a2 2 0 0 0 1.79-1.11l3.54-7.11A1 1 0 0 0 21 6H7z"/>
            </svg>
            {count > 0 && <span className="cart__badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
