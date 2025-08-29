import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useFavorites } from "@/store/favorites";
import { useProducts } from "@/store/product";
import "./header.css";

function formatTRY(n: number) {
  return `${(n ?? 0).toFixed(2)} ₺`;
}

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { items: favMap, fetch: fetchFavs, remove: removeFav } = useFavorites();
  const { items: products, fetch: fetchProducts } = useProducts();

  const favCount = Object.keys(favMap).length;

  const [openMobile, setOpenMobile] = useState(false);
  const [openFav, setOpenFav] = useState(false);

  // route değişince menüleri kapat
  useEffect(() => {
    const close = () => {
      setOpenMobile(false);
      setOpenFav(false);
    };
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
    };
  }, []);

  // Favoriler ve ürünler (popover için gerekli)
  useEffect(() => {
    fetchFavs().catch(() => {});
    fetchProducts().catch(() => {});
  }, [fetchFavs, fetchProducts]);

  // product_id -> product
  const productMap = useMemo(
    () => new Map(products.map((p: any) => [p.id, p])),
    [products]
  );

  // Popover’da göstereceğimiz listeyi zenginleştir
  const favList = useMemo(() => {
    const arr = Object.values(favMap);
    return arr.map((f: any) => {
      const p = productMap.get(f.product_id);
      return {
        productId: f.product_id,
        title: f.title ?? p?.title ?? "Ürün",
        price: f.price ?? p?.price ?? 0,
        image: (f.image ?? p?.image) as string | undefined,
      };
    });
  }, [favMap, productMap]);

  // Kalp popover dışı tıklama ile kapanma
  const favBtnRef = useRef<HTMLAnchorElement | null>(null);
  const favPopRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!openFav) return;
      if (favBtnRef.current?.contains(t)) return;
      if (favPopRef.current?.contains(t)) return;
      setOpenFav(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openFav]);

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link
          to="/"
          className="logo"
          onClick={() => {
            setOpenMobile(false);
            setOpenFav(false);
          }}
        >
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

          {/* FAVORİLER – açılır pencere */}
          <a
            href="#"
            ref={favBtnRef}
            className="fav"
            aria-label="Favoriler"
            aria-haspopup="dialog"
            aria-expanded={openFav}
            onClick={(e) => {
              e.preventDefault();
              setOpenFav((s) => !s);
              setOpenMobile(false);
            }}
          >
            <svg className="fav__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.1 21.35l-1.1-.99C5.14 15.36 2 12.5 2 8.92 2 6.2 4.2 4 6.92 4c1.54 0 3.04.7 4.08 1.84A5.53 5.53 0 0 1 15.08 4C17.8 4 20 6.2 20 8.92c0 3.58-3.14 6.44-8.02 11.44l-.88.99z" />
            </svg>
            {favCount > 0 && <span className="fav__badge">{favCount}</span>}
          </a>

          {/* POPOVER */}
          {openFav && (
            <div
              className="fav-popover"
              ref={favPopRef}
              role="dialog"
              aria-label="Favoriler"
            >
              <div className="fav-popover__header">
                <strong>Favoriler</strong>
                <Link
                  to="/favorites"
                  className="link"
                  onClick={() => setOpenFav(false)}
                >
                  Tümünü Gör
                </Link>
              </div>

              {favList.length === 0 ? (
                <div className="fav-popover__empty">Favori ürün yok.</div>
              ) : (
                <div className="fav-popover__list">
                  {favList.map((f) => (
                    <div className="fav-item" key={f.productId}>
                      <div className="fav-item__media">
                        {f.image ? (
                          <img src={f.image} alt={f.title} />
                        ) : (
                          <div className="img-ph" />
                        )}
                      </div>
                      <div className="fav-item__info">
                        <div className="fav-item__title" title={f.title}>
                          {f.title}
                        </div>
                        <div className="fav-item__price">
                          {formatTRY(f.price)}
                        </div>
                      </div>
                      <button
                        className="fav-item__remove"
                        onClick={() =>
                          removeFav(f.productId).catch(console.error)
                        }
                        aria-label="Favoriden kaldır"
                        title="Kaldır"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="fav-popover__footer">
                <Link
                  to="/favorites"
                  className="btn btn--primary"
                  onClick={() => setOpenFav(false)}
                >
                  Favoriler Sayfası
                </Link>
              </div>
            </div>
          )}

          {/* Auth */}
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

          {/* Sepet */}
          <Link
            to="/cart"
            className="cart"
            aria-label="Sepet"
            onClick={() => setOpenFav(false)}
          >
            <svg className="cart__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 20h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 16h6.55a2 2 0 0 0 1.79-1.11l3.54-7.11A1 1 0 0 0 21 6H7z" />
            </svg>
            {count > 0 && <span className="cart__badge">{count}</span>}
          </Link>

          <button
            className="menu-btn"
            aria-label="Menüyü aç/kapat"
            aria-expanded={openMobile}
            aria-controls="mobile-menu"
            onClick={() => {
              setOpenMobile((s) => !s);
              setOpenFav(false);
            }}
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
        className={`mobile ${openMobile ? "mobile--open" : ""}`}
        onClick={() => setOpenMobile(false)}
      >
        <div className="mobile__panel" onClick={(e) => e.stopPropagation()}>
          <nav className="nav nav--mobile" aria-label="Primary mobile">
            <NavLink
              to="/"
              end
              className="nav__link"
              onClick={() => setOpenMobile(false)}
            >
              Mağaza
            </NavLink>
            <NavLink
              to="/favorites"
              className="nav__link"
              onClick={() => setOpenMobile(false)}
            >
              Favoriler {favCount > 0 ? `(${favCount})` : ""}
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="nav__link"
                onClick={() => setOpenMobile(false)}
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
                onClick={() => setOpenMobile(false)}
              >
                Kayıt Ol
              </Link>
              <Link
                to="/login"
                className="btn btn--primary"
                onClick={() => setOpenMobile(false)}
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
                  setOpenMobile(false);
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
