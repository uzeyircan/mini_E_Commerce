import { useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  return (
    <div className="card">
      <img className="thumb" src={p.image} alt={p.title} loading="lazy" />

      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>{p.title}</strong>
        <span className="badge">{p.rating.toFixed(1)}★</span>
      </div>

      <div className="muted">{p.description}</div>

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
        onClick={() =>
          add(
            { id: p.id, title: p.title, price: p.price, image: p.image }, // qty YOK
            qty // <-- miktar 2. parametre
          )
        }
      >
        Sepete Ekle
      </button>
    </div>
  );
}
