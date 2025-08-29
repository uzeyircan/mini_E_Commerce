import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import "./header.css";

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  // route değişince menüyü kapat
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
    };
  }, []);

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          miniCommerce
        </Link>

        {/* Desktop nav */}
        <nav className="nav nav--desktop" aria-label="Primary">
          <NavLink to="/" end className="nav__link">
            Mağaza
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="nav__link">
              Admin Panel
            </NavLink>
          )}
          
        </nav>

        {/* Sağ aksiyonlar */}
        <div className="hdr__right">
          {user && (
            <Link to="/profile" className="userchip" title="Profil">
              {user.email?.[0]?.toUpperCase()}
            </Link>
          )}
          {!user ? (
            <div className="auth auth--out">
              <Link to="/register" className="btn btn--ghost">
                Kayıt Ol
              </Link>
              <Link to="/login" className="btn btn--primary">
                Giriş Yap
              </Link>
            </div>
          ) : (
            <div className="auth auth--in">
              
              <button className="btn btn--ghost" onClick={logout}>
                Çıkış
              </button>
            </div>
          )}

          <Link to="/cart" className="cart" aria-label="Sepet">
            <svg className="cart__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 20h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 16h6.55a2 2 0 0 0 1.79-1.11l3.54-7.11A1 1 0 0 0 21 6H7z" />
            </svg>
            {count > 0 && <span className="cart__badge">{count}</span>}
          </Link>

          {/* Hamburger */}
          <button
            className="menu-btn"
            aria-label="Menüyü aç/kapat"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((s) => !s)}
          >
            <span className="menu-btn__bar" />
            <span className="menu-btn__bar" />
            <span className="menu-btn__bar" />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        className={`mobile ${open ? "mobile--open" : ""}`}
        onClick={() => setOpen(false)}
      >
        <div className="mobile__panel" onClick={(e) => e.stopPropagation()}>
          <nav className="nav nav--mobile" aria-label="Primary mobile">
            <NavLink
              to="/"
              end
              className="nav__link"
              onClick={() => setOpen(false)}
            >
              Mağaza
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="nav__link"
                onClick={() => setOpen(false)}
              >
                Admin Panel
              </NavLink>
            )}
          </nav>

          {!user ? (
            <div className="auth auth--mobile">
              <Link
                to="/register"
                className="btn btn--ghost"
                onClick={() => setOpen(false)}
              >
                Kayıt Ol
              </Link>
              <Link
                to="/login"
                className="btn btn--primary"
                onClick={() => setOpen(false)}
              >
                Giriş Yap
              </Link>
            </div>
          ) : (
            <div className="auth auth--mobile">
              <span className="userchip userchip--mobile">{user.email}</span>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Çıkış
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
