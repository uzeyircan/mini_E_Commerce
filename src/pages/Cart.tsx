import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useProducts } from "@/store/product";
import { useFavorites } from "@/store/favorites";

export default function CartPage() {
  const { items, fetch, increase, decrease, setQty, remove, removeMany } =
    useCart();
  const { items: products, fetch: fetchProducts } = useProducts();
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  useEffect(() => {
    fetch().catch(console.error);
    fetchProducts().catch(console.error);
  }, [fetch, fetchProducts]);

  // seçim
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.product_id] = selected[i.product_id] ?? true));
    setSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const allChecked =
    items.length > 0 && items.every((i) => selected[i.product_id]);
  const anyChecked = items.some((i) => selected[i.product_id]);
  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.product_id] = checked));
    setSelected(next);
  };

  const allRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate = anyChecked && !allChecked;
    }
  }, [anyChecked, allChecked]);

  const selectedItems = items.filter((i) => selected[i.product_id]);
  const selectedTotal = selectedItems.reduce((s, i) => {
    const p = productMap.get(i.product_id);
    return s + (p?.price ?? 0) * i.qty;
  }, 0);

  // Favoriler
  const addFav = useFavorites((s) => s.add);
  const favItems = useFavorites((s) => s.items);
  const removeFavLocal = useFavorites((s) => s.remove); // listede kaldırmak için de kullanılır

  // Kaldır modal
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const closeConfirm = () => setConfirmId(null);

  const handleRemove = async (productId: string, alsoFavorite: boolean) => {
    const p = productMap.get(productId);
    if (alsoFavorite && p) {
      await addFav({ product_id: p.id }); // title/price istersen zenginleştir
    }
    await remove(productId);
    closeConfirm();
  };

  const onPurchase = async () => {
    if (selectedItems.length === 0) {
      alert("Satın almak için en az bir ürünü seçin.");
      return;
    }
    await removeMany(selectedItems.map((i) => i.product_id));
    alert("Satın alma işlemi başarıyla tamamlandı! 🎉");
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Sepet</h1>
        <p className="muted">Sepetiniz boş.</p>
        <FavoritesSection favs={favItems} removeFav={removeFavLocal} />
      </div>
    );
  }

  const confirmImage = confirmId ? productMap.get(confirmId)?.image : undefined;
  const confirmTitle = confirmId ? productMap.get(confirmId)?.title ?? "" : "";
  const confirmPrice = confirmId ? productMap.get(confirmId)?.price ?? 0 : 0;

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

      {/* üst bar */}
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
            onClick={() => removeMany(items.map((i) => i.product_id))}
            style={{ borderColor: "#ef4444", color: "#b91c1c", marginLeft: 8 }}
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

      {/* tablo */}
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
                const p = productMap.get(i.product_id);
                const price = p?.price ?? 0;
                return (
                  <tr
                    key={i.product_id}
                    style={{ borderTop: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                      <input
                        type="checkbox"
                        checked={!!selected[i.product_id]}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [i.product_id]: e.target.checked,
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
                        <div style={{ fontWeight: 600 }}>
                          {p?.title ?? "Ürün"}
                        </div>
                        {typeof p?.stock === "number" && (
                          <div style={{ color: "#6b7280", fontSize: 12 }}>
                            Stok: {p.stock}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>{price.toFixed(2)} ₺</td>

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
                          onClick={() => decrease(i.product_id)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={i.qty}
                          onChange={(e) =>
                            setQty(
                              i.product_id,
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
                          onClick={() => increase(i.product_id)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>{(price * i.qty).toFixed(2)} ₺</td>

                    <td>
                      <button
                        className="btn btn--primary"
                        onClick={() => setConfirmId(i.product_id)}
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

      {/* alt toplam */}
      <div
        className="card"
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <div style={{ marginLeft: "auto", fontWeight: 700 }}>
          Seçili Toplam: {selectedTotal.toFixed(2)} ₺
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
      <FavoritesSection favs={favItems} removeFav={removeFavLocal} />

      {/* Kaldırma Modalı */}
      {confirmId && (
        <ConfirmRemoveModal
          title={confirmTitle}
          price={confirmPrice}
          image={confirmImage ?? undefined}
          onClose={closeConfirm}
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
  favs: Record<string, { product_id: string }>;
  removeFav: (id: string) => Promise<void>;
}) {
  const list = Object.values(favs);
  if (list.length === 0) return null;

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Favoriler</h2>
      {list.map((f) => (
        <div
          key={f.product_id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 12,
          }}
        >
          <div style={{ flex: 1 }}>Ürün ID: {f.product_id}</div>
          <button
            className="btn btn--primary"
            onClick={() => removeFav(f.product_id)}
          >
            Kaldır
          </button>
        </div>
      ))}
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
