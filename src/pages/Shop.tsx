// src/pages/Shop.tsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "@/store/product";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useAuth } from "@/store/auth";
import { useCategories } from "@/store/category";
import FadeIn from "@/components/anim/FadeIn";
import Aurora from "@/components/anim/Aurora";

export default function Shop() {
  const { items, fetch } = useProducts();
  const { add } = useCart();

  const favs = useFavorites((s) => s.items);
  const addFav = useFavorites((s) => s.add);
  const removeFav = useFavorites((s) => s.remove);
  const fetchFavs = useFavorites((s) => s.fetch);

  const cats = useCategories((s) => s.items);
  const fetchCats = useCategories((s) => s.fetch);

  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  // Ürünler
  useEffect(() => {
    fetch().catch(console.error);
  }, [fetch]);

  // Kategoriler (etiket göstermek için)
  useEffect(() => {
    fetchCats().catch(console.error);
  }, [fetchCats]);

  // Favoriler sadece kullanıcı varken çekilir
  useEffect(() => {
    if (user) fetchFavs().catch(console.error);
  }, [user, fetchFavs]);

  const requireAuth = () => {
    if (!user) {
      alert("Lütfen giriş yapınız / kayıt olunuz.");
      nav("/login", { state: { from: loc.pathname } });
      return true;
    }
    return false;
  };

  const handleAdd = (p: { id: string; title: string; price: number }) => {
    if (requireAuth()) return;
    add({ id: p.id, title: p.title, price: p.price }, 1);
    setBouncingId(p.id);
    setTimeout(() => setBouncingId(null), 300);
  };

  const toggleFav = async (productId: string) => {
    if (requireAuth()) return;
    if (favs[productId]) await removeFav(productId);
    else await addFav({ product_id: productId });
  };

  if (!items.length) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Mağaza</h1>
        <p className="muted">Henüz ürün yok.</p>
        {user?.role === "admin" && (
          <p>
            Ürün eklemek için <Link to="/admin">Admin Panel</Link>’e gidin.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "24px auto",
        padding: "0 16px",
        position: "relative",
      }}
    >
      {/* Arka plan animasyonu (içeriğe dokunmaz) */}
      <Aurora />

      <FadeIn y={18}>
        <h1>Mağaza</h1>
      </FadeIn>

      <FadeIn delay={0.04} y={12}>
        <div className="grid">
          {items.map((p, i) => {
            const isFav = !!favs[p.id];
            // Kategori adı: JOIN'den geldiyse p.category_name, yoksa sözlükten
            const catName =
              p.category_name ??
              (p.category_id ? cats[p.category_id]?.name : undefined);

            return (
              <FadeIn key={p.id} delay={i * 0.04} y={14}>
                <article className="card" style={{ display: "grid", gap: 8 }}>
                  <Link
                    to={`/product/${p.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 12,
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          height: 180,
                          borderRadius: 12,
                          background: "#f1f5f9",
                          display: "grid",
                          placeItems: "center",
                          color: "#64748b",
                        }}
                      >
                        Görsel yok
                      </div>
                    )}

                    <strong
                      style={{ fontSize: 16, display: "block", marginTop: 6 }}
                    >
                      {p.title}
                    </strong>

                    {catName && (
                      <span
                        className="muted"
                        aria-label="Ürün kategorisi"
                        title={`Kategori: ${catName}`}
                        style={{
                          display: "inline-block",
                          marginTop: 4,
                          fontSize: 12,
                          opacity: 0.8,
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: "1px solid #334",
                        }}
                      >
                        {catName}
                      </span>
                    )}
                  </Link>

                  <span style={{ color: "#111" }}>{p.price.toFixed(2)} ₺</span>

                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <button
                      className={`btn btn--primary ${
                        bouncingId === p.id ? "button-bounce" : ""
                      }`}
                      onClick={() => handleAdd(p)}
                    >
                      Sepete Ekle
                    </button>

                    <button
                      className={`btn btn--ghost ${isFav ? "is-fav" : ""}`}
                      onClick={() => toggleFav(p.id)}
                      title={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            fill={isFav ? "currentColor" : "none"}
                            stroke="currentColor"
                            d="M12.1 21.35l-1.1-1.02C5.14 15.24 2 12.39 2 8.92A4.92 4.92 0 016.92 4c1.54 0 3.04.7 4.08 1.8A5.56 5.56 0 0115.08 4 4.92 4.92 0 0120 8.92c0 3.47-3.14 6.32-8.01 11.41l-.89 1.02z"
                          />
                        </svg>
                        {isFav ? "Favoride" : "Favorile"}
                      </span>
                    </button>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </FadeIn>
    </div>
  );
}
