import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cart";
import { useProducts } from "@/store/product"; // varsa görsel göstermek için

export default function CartPage() {
  const { items, increase, decrease, setQty, remove, removeMany } = useCart();
  const { items: products } = useProducts(); // opsiyonel (image için)
  const productMap = useMemo(() => {
    const m = new Map(products.map((p) => [p.id, p]));
    return m;
  }, [products]);

  // Seçim durumu: varsayılan hepsi seçili
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.id] = selected[i.id] ?? true));
    setSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const allChecked = items.length > 0 && items.every((i) => selected[i.id]);
  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.id] = checked));
    setSelected(next);
  };

  const selectedItems = items.filter((i) => selected[i.id]);
  const selectedTotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);

  const onPurchase = async () => {
    if (selectedItems.length === 0) {
      alert("Satın almak için en az bir ürünü seçin.");
      return;
    }
    // TODO: Backend ödeme entegrasyonu
    removeMany(selectedItems.map((i) => i.id));
    alert("Satın alma işlemi başarıyla tamamlandı! 🎉");
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Sepet</h1>
        <p style={{ color: "#6b7280" }}>Sepetiniz boş.</p>
      </div>
    );
  }

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
      <h1>Sepet</h1>

      {/* Üst çubuk */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 12px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <button className="btn btn--ghost">
            <span
              style={{
                padding: 15,
              }}
            >
              Tümünü seç
            </span>
          </button>
        </label>

        {/* Tümü seçiliyken göster */}
        {allChecked && (
          <button
            className="btn btn--ghost"
            onClick={() => removeMany(items.map((i) => i.id))}
            style={{
              borderColor: "#ef4444",
              color: "#b91c1c",
              marginLeft: 8,
            }}
            aria-label="Tümünü Kaldır"
            title="Sepetteki tüm ürünleri kaldır"
          >
            Tümünü Kaldır
          </button>
        )}

        <span style={{ marginLeft: "auto", color: "#6b7280" }}>
          Seçili: {selectedItems.length} ürün — Toplam:{" "}
          {selectedTotal.toFixed(2)} ₺
        </span>
        <button
          className="btn btn--primary"
          disabled={selectedItems.length === 0}
          onClick={onPurchase}
        >
          Satın Al
        </button>
      </div>

      {/* Liste */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                <th style={{ padding: "10px 12px" }}></th>
                <th style={{ padding: "10px 12px" }}>Ürün</th>
                <th>Fiyat</th>
                <th>Adet</th>
                <th>Ara Toplam</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const p = productMap.get(i.id);
                return (
                  <tr key={i.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                      <input
                        type="checkbox"
                        checked={!!selected[i.id]}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [i.id]: e.target.checked,
                          }))
                        }
                        aria-label="Ürünü seç"
                      />
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      {p?.image && (
                        <img
                          src={p.image}
                          alt=""
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{i.title}</div>
                        {typeof p?.stock === "number" && (
                          <div style={{ color: "#6b7280", fontSize: 12 }}>
                            Stok: {p.stock}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{i.price.toFixed(2)} ₺</td>
                    <td>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <button
                          className="btn btn--ghost"
                          onClick={() => decrease(i.id)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={i.qty}
                          onChange={(e) =>
                            setQty(
                              i.id,
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          style={{
                            width: 64,
                            textAlign: "center",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "6px 8px",
                          }}
                        />
                        <button
                          className="btn btn--ghost"
                          onClick={() => increase(i.id)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{(i.price * i.qty).toFixed(2)} ₺</td>
                    <td>
                      <button
                        className="btn btn--primary"
                        onClick={() => remove(i.id)}
                      >
                        Kaldır
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt özet + satın al */}
      <div
        className="card"
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontWeight: 700 }}>
            Seçili Toplam: {selectedTotal.toFixed(2)} ₺
          </div>
        </div>
        <button
          className="btn btn--primary"
          disabled={selectedItems.length === 0}
          onClick={onPurchase}
        >
          Satın Al
        </button>
      </div>
    </div>
  );
}
