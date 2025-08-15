import { Link, NavLink } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useFavorites } from "@/store/favorites";
import { useEffect, useRef, useState } from "react";
import "./header.css";

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  const favItems = useFavorites((s) => s.items);
  const removeFav = useFavorites((s) => s.remove);
  const favCount = Object.keys(favItems).length;

  const [favOpen, setFavOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Panel dışında tıklayınca kapat
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setFavOpen(false);
    }
    if (favOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [favOpen]);

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link to="/" className="logo">
          miniCommerce
        </Link>

        <nav className="nav">
          <NavLink to="/" className="nav__link">
            Mağaza
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="nav__link">
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="hdr__right">
          {!user ? (
            <div className="auth">
              <Link to="/register" className="btn btn--ghost">
                Kayıt Ol
              </Link>
              <Link to="/login" className="btn btn--primary">
                Giriş Yap
              </Link>
            </div>
          ) : (
            <div className="auth auth--in">
              <span className="userchip">{user.email}</span>
              <button className="btn btn--ghost" onClick={logout}>
                Çıkış
              </button>
            </div>
          )}

          {/* Favoriler (kalp) */}
          <div className="favwrap" ref={panelRef}>
            <button
              type="button"
              className="fav"
              aria-label="Favoriler"
              aria-expanded={favOpen}
              onClick={() => setFavOpen((v) => !v)}
            >
              <svg
                className={`fav__icon ${favCount > 0 ? "is-active" : ""}`}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M12 21s-6.7-4.35-9.33-7.5C.86 11.37 1 8.4 3.05 6.5 5.03 4.68 7.9 4.94 9.73 6.4L12 8.26l2.27-1.86C16.1 4.94 18.97 4.68 20.95 6.5c2.05 1.9 2.2 4.87.38 7C18.7 16.65 12 21 12 21z" />
              </svg>
              {favCount > 0 && <span className="fav__badge">{favCount}</span>}
            </button>

            {favOpen && (
              <div
                className="favpanel"
                role="dialog"
                aria-label="Favoriler paneli"
              >
                <div className="favpanel__header">
                  <strong>Favoriler</strong>
                  {favCount === 0 && (
                    <span className="muted">Henüz favori yok</span>
                  )}
                </div>
                <div className="favpanel__body">
                  {favCount > 0 &&
                    Object.values(favItems).map((f) => (
                      <div key={f.id} className="favitem">
                        {f.image ? (
                          <img src={f.image} alt="" className="favitem__img" />
                        ) : (
                          <div className="favitem__img --placeholder">IMG</div>
                        )}
                        <div className="favitem__meta">
                          <div className="favitem__title">{f.title}</div>
                          <div className="favitem__price">
                            {f.price.toFixed(2)} ₺
                          </div>
                        </div>
                        <button
                          className="btn btn--ghost"
                          onClick={() => removeFav(f.id)}
                        >
                          Kaldır
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Sepet */}
          <Link to="/cart" className="cart" aria-label="Sepet">
            <svg className="cart__icon" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 20h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 16h6.55a2 2 0 0 0 1.79-1.11l3.54-7.11A1 1 0 0 0 21 6H7z" />
            </svg>
            {count > 0 && <span className="cart__badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
