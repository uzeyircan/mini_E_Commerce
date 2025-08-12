import { useState } from "react";
import { Product, useProducts } from "@/store/product";

type Props = { onEdit: (p: Product) => void };

export default function ProductTable({ onEdit }: Props) {
  const items = useProducts((s) => s.items);
  const remove = useProducts((s) => s.remove);
  const [q, setQ] = useState("");

  const filtered = items.filter((p) =>
    p.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="card" style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <strong>Ürünler</strong>
        <input
          placeholder="Ara..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "6px 10px",
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f8fafc" }}>
              <th style={{ padding: "10px 12px" }}>Görsel</th>
              <th>Başlık</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th style={{ width: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 12px" }}>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{p.title}</td>
                <td>{p.price.toFixed(2)} ₺</td>
                <td>{p.stock ?? "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn--ghost"
                      onClick={() => onEdit(p)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={() => remove(p.id)}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, color: "#6b7280" }}>
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
