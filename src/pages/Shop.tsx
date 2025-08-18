import { useProducts } from "@/store/product";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useFavorites } from "@/store/favorites";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Link as RLink } from "react-router-dom"; // istersen farklı isimle
import { useState } from "react";

export default function Shop() {
  const { items } = useProducts();
  const { add } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // Favoriler store
  const favs = useFavorites((s) => s.items);
  const addFav = useFavorites((s) => s.add);
  const removeFav = useFavorites((s) => s.remove);

  // Sepete ekle bounce (ürün bazlı)
  const [bounce, setBounce] = useState<Record<string, boolean>>({});

  const handleAdd = (p: {
    id: string;
    title: string;
    price: number;
    image: string;
  }) => {
    if (!user) {
      alert("Lütfen kayıt olunuz / giriş yapınız.");
      nav("/register", { state: { from: loc.pathname } });
      return;
    }
    add({ id: p.id, title: p.title, price: p.price, image: p.image }, 1);
    setBounce((s) => ({ ...s, [p.id]: true }));
    setTimeout(() => setBounce((s) => ({ ...s, [p.id]: false })), 300);
  };

  const toggleFav = (p: {
    id: string;
    title: string;
    price: number;
    image: string;
  }) => {
    if (favs[p.id]) removeFav(p.id);
    else addFav({ id: p.id, title: p.title, price: p.price, image: p.image });
  };

  if (!items.length) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Mağaza</h1>
        <p style={{ color: "#6b7280" }}>Henüz ürün yok.</p>
        {user?.role === "admin" && (
          <p>
            Ürün eklemek için <Link to="/admin">Admin Panel</Link>’e gidin.
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
      <h1>Mağaza</h1>
      <div className="grid">
        {items.map((p) => {
          const isFav = !!favs[p.id];
          return (
            <article
              key={p.id}
              className="card"
              style={{ display: "grid", gap: 8 }}
            >
              <RLink
                to={`/product/${p.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {p.image && (
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
                )}
                <strong
                  style={{ fontSize: 16, display: "block", marginTop: 6 }}
                >
                  {p.title}
                </strong>
              </RLink>
              <span style={{ color: "#111" }}>{p.price.toFixed(2)} ₺</span>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ cursor: "pointer", flex: 1 }}
                  className={`btn btn--primary ${
                    bounce[p.id] ? "button-bounce" : ""
                  }`}
                  onClick={() => handleAdd(p)}
                >
                  Sepete Ekle
                </button>

                {/* Kalp/Favori butonu */}
                <button
                  type="button"
                  className={`btn favbtn ${isFav ? "is-active" : ""}`}
                  aria-label={isFav ? "Favoriden çıkar" : "Favorilere ekle"}
                  title={isFav ? "Favoriden çıkar" : "Favorilere ekle"}
                  onClick={() => toggleFav(p)}
                >
                  <svg className="favbtn__icon" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 21s-6.7-4.35-9.33-7.5C.86 11.37 1 8.4 3.05 6.5 5.03 4.68 7.9 4.94 9.73 6.4L12 8.26l2.27-1.86C16.1 4.94 18.97 4.68 20.95 6.5c2.05 1.9 2.2 4.87.38 7C18.7 16.65 12 21 12 21z" />
                  </svg>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
