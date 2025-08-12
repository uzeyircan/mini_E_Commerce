import { useProducts } from "@/store/product";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Shop() {
  const { items } = useProducts();
  const { add } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const handleAdd = (p: { id: string; title: string; price: number }) => {
    if (!user) {
      alert("Lütfen kayıt olunuz / giriş yapınız.");
      // kayıt/girişten sonra geri dönebilsin
      nav("/register", { state: { from: loc.pathname } });
      return;
    }
    add({ id: p.id, title: p.title, price: p.price }, 1);
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
        {items.map((p) => (
          <article
            key={p.id}
            className="card"
            style={{ display: "grid", gap: 8 }}
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
            <strong style={{ fontSize: 16 }}>{p.title}</strong>
            <span style={{ color: "#111" }}>{p.price.toFixed(2)} ₺</span>
            <button
              className="btn btn--primary"
              onClick={() =>
                add({ id: p.id, title: p.title, price: p.price }, 1)
              }
            >
              Sepete Ekle
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
