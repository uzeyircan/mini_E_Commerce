import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useProducts } from "@/store/product";
import { useFavorites, Fav } from "@/store/favorites";

export default function CartPage() {
  const { items, increase, decrease, setQty, remove, removeMany } = useCart();
  const { items: products } = useProducts(); // görsel için
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  // --- Seçim mantığı ---
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.id] = selected[i.id] ?? true));
    setSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const allChecked = items.length > 0 && items.every((i) => selected[i.id]);
  const anyChecked = items.some((i) => selected[i.id]);
  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.id] = checked));
    setSelected(next);
  };

  // indeterminate görseli
  const allRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate = anyChecked && !allChecked;
    }
  }, [anyChecked, allChecked]);

  const selectedItems = items.filter((i) => selected[i.id]);
  const selectedTotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);

  // --- Favoriler STORE ---
  const favItems = useFavorites((s) => s.items);
  const addFav = useFavorites((s) => s.add);
  const removeFav = useFavorites((s) => s.remove);

  // --- Kaldırma modalı ---
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const openConfirm = (id: string) => setConfirmId(id);
  const closeConfirm = () => setConfirmId(null);

  const handleRemove = (id: string, alsoFavorite: boolean) => {
    const ci = items.find((x) => x.id === id);
    if (ci) {
      const p = productMap.get(ci.id);
      if (alsoFavorite) {
        addFav({
          id: ci.id,
          title: ci.title,
          price: ci.price,
          image: p?.image,
        });
      }
      remove(ci.id);
    }
    closeConfirm();
  };

  // Satın alma (seçilenleri)
  const onPurchase = async () => {
    if (selectedItems.length === 0) {
      alert("Satın almak için en az bir ürünü seçin.");
      return;
    }
    removeMany(selectedItems.map((i) => i.id));
    alert("Satın alma işlemi başarıyla tamamlandı! 🎉");
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Sepet</h1>
        <p style={{ color: "#6b7280" }}>Sepetiniz boş.</p>
        <FavoritesSection favs={favItems} removeFav={removeFav} />
      </div>
    );
  }

  const confirmItem = confirmId
    ? items.find((i) => i.id === confirmId)
    : undefined;
  const confirmImage = confirmId ? productMap.get(confirmId)?.image : undefined;

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
            ref={allRef}
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
            aria-label="Tüm ürünleri seç"
          />
          <span>Tümünü seç</span>
        </label>

        {allChecked && (
          <button
            className="btn btn--ghost"
            onClick={() => removeMany(items.map((i) => i.id))}
            style={{ borderColor: "#ef4444", color: "#b91c1c", marginLeft: 8 }}
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
                <th style={{ width: 160 }}></th>
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
                        onClick={() => setConfirmId(i.id)}
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

      {/* Favoriler bölümü */}
      <FavoritesSection favs={favItems} removeFav={removeFav} />

      {/* Kaldırma Modalı */}
      {confirmId && (
        <ConfirmRemoveModal
          title={items.find((i) => i.id === confirmId)?.title || ""}
          price={items.find((i) => i.id === confirmId)?.price || 0}
          image={productMap.get(confirmId)?.image}
          onClose={() => setConfirmId(null)}
          onRemove={() => handleRemove(confirmId, false)}
          onRemoveAndFav={() => handleRemove(confirmId, true)}
        />
      )}
    </div>
  );
}

function FavoritesSection({
  favs,
  removeFav,
}: {
  favs: Record<string, Fav>;
  removeFav: (id: string) => void;
}) {
  const list = Object.values(favs);
  if (list.length === 0) return null;

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Favoriler</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((f) => (
          <div
            key={f.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 12,
            }}
          >
            {f.image && (
              <img
                src={f.image}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{f.title}</div>
              <div style={{ color: "#111" }}>{f.price.toFixed(2)} ₺</div>
            </div>
            <button
              className="btn btn--primary"
              onClick={() => removeFav(f.id)}
            >
              Kaldır
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmRemoveModal({
  title,
  price,
  image,
  onClose,
  onRemove,
  onRemoveAndFav,
}: {
  title: string;
  price: number;
  image?: string;
  onClose: () => void;
  onRemove: () => void;
  onRemoveAndFav: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal__backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {image && (
            <img
              src={image}
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
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
            <div style={{ color: "#111" }}>{price.toFixed(2)} ₺</div>
          </div>
        </div>
        <p style={{ marginTop: 12, color: "#374151" }}>
          Bu ürünü kaldırmak istiyor musunuz?
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button className="btn btn--ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn--ghost" onClick={onRemove}>
            Kaldır
          </button>
          <button className="btn btn--primary" onClick={onRemoveAndFav}>
            Kaldır ve Favorilere Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
