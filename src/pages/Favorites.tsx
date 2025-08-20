import { useEffect } from "react";
import { useFavorites } from "@/store/favorites";
import { useProducts } from "@/store/product";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { items: products, fetch: fetchProducts } = useProducts();
  const favs = useFavorites((s) => s.items);
  const fetchFavs = useFavorites((s) => s.fetch);
  const removeFav = useFavorites((s) => s.remove);

  useEffect(() => {
    fetchProducts().catch(console.error);
    fetchFavs().catch(console.error);
  }, [fetchProducts, fetchFavs]);

  const favList = Object.values(favs);

  return (
    <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
      <h1>Favorilerim</h1>

      {favList.length === 0 ? (
        <p className="muted">Henüz favori ürününüz yok.</p>
      ) : (
        <div className="grid">
          {favList.map((f) => {
            const p = products.find((x) => x.id === f.product_id);
            return (
              <article
                key={f.product_id}
                className="card"
                style={{ display: "grid", gap: 8 }}
              >
                <Link
                  to={`/product/${f.product_id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {p?.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
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
                    {p?.title || f.product_id}
                  </strong>
                </Link>
                {p && (
                  <span style={{ color: "#111" }}>{p.price.toFixed(2)} ₺</span>
                )}
                <button
                  className="btn btn--primary"
                  onClick={() => removeFav(f.product_id)}
                >
                  Kaldır
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
