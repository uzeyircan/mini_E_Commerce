import { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";
import { useProducts, Product } from "@/store/product";

export default function AdminDashboard() {
  const { items, fetch, remove } = useProducts(); // 👈 remove'u al
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    fetch().catch(console.error);
  }, [fetch]);

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`“${title}” ürününü silmek istiyor musunuz?`)) return;
    try {
      await remove(id);
    } catch (e: any) {
      alert(e?.message || "Silme sırasında bir hata oluştu.");
    }
  };

  const handleFormDone = async () => {
    setEditing(null);
    // ✅ Ürün eklendi/düzenlendiğinde listeyi tazele
    await fetch().catch(console.error);
  };

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "24px auto",
        padding: "0 16px",
        display: "grid",
        gap: 16,
      }}
    >
      <h1>Admin Panel</h1>

      <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        {/* ProductForm: onDone olduğunda listeyi yeniliyoruz */}
        <ProductForm edit={editing} onDone={handleFormDone} />

        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                <th style={{ padding: "10px 12px" }}>Ürün</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th style={{ width: 200 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td
                    style={{
                      padding: "10px 12px",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    {p.image && (
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
                    )}
                    <div>{p.title}</div>
                  </td>
                  <td>{Number(p.price).toFixed(2)} ₺</td>
                  <td>{p.stock ?? "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn--ghost"
                        onClick={() => setEditing(p)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn btn--primary"
                        onClick={() => onDelete(p.id, p.title)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 12 }} className="muted">
                    Ürün yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
