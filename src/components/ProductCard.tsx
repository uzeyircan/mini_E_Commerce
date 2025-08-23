import { useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  return (
    <div className="card">
      {p.image && (
        <img className="thumb" src={p.image} alt={p.title} loading="lazy" />
      )}

      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>{p.title}</strong>
        {"rating" in p && p.rating != null && (
          <span className="badge">{Number(p.rating).toFixed(1)}★</span>
        )}
      </div>

      {p.description && <div className="muted">{p.description}</div>}

      <div className="row">
        <select
          className="select"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value))}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="spacer" />
      <div className="price">{p.price.toFixed(2)} ₺</div>

      <button
        className="btn"
        onClick={() => add({ id: p.id, title: p.title, price: p.price }, qty)}
      >
        Sepete Ekle
      </button>
    </div>
  );
}
