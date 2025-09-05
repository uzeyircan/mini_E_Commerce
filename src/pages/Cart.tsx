import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useProducts } from "@/store/product";
import { useFavorites } from "@/store/favorites";
import { useAuth } from "@/store/auth";

export default function CartPage() {
  const { user, isHydrated } = useAuth();

  // Sepet store
  const { items, fetch, increase, decrease, setQty, remove, removeMany, add } =
    useCart();

  // Ürün store
  const { items: products, fetch: fetchProducts } = useProducts();

  // Ürün map (id -> ürün)
  const productMap = useMemo(
    () => new Map(products.map((p: any) => [p.id, p])),
    [products]
  );
  // Favoriler store
  const addFav = useFavorites((s) => s.add);
  const favItems = useFavorites((s) => s.items);
  const removeFavLocal = useFavorites((s) => s.remove);
  const fetchFavs = useFavorites((s) => s.fetch); // <-- favorileri yüklemek için
  //   // Tekli kaldırma modal state
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const closeConfirm = () => setConfirmId(null);

  // ⚠️ Auth hidrasyonu tamamlanmadan veri çekme!
  useEffect(() => {
    if (!isHydrated) return; // auth durumu netleşmeden hiçbir çağrı yapma
    if (!user) return; // (cart route zaten protected ama yine de koruyalım)
    fetch().catch(console.error);
    fetchProducts().catch(console.error);
    fetchFavs?.().catch?.(console.error); // <-- favorileri de çek!
  }, [isHydrated, user, fetch, fetchProducts, fetchFavs]);

  // seçim state'i
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

  // seçili öğeler & toplam
  const selectedItems = items.filter((i) => selected[i.product_id]);
  const selectedTotal = selectedItems.reduce((s, i) => {
    const p = productMap.get(i.product_id);
    const price = Number(p?.price ?? 0);
    const qty = Number(i.qty ?? 1);
    return s + price * qty;
  }, 0);

  // Toplu kaldırma modal state
  const [bulkOpen, setBulkOpen] = useState(false);

  // Tekli kaldırma: opsiyonel favorile
  const handleRemove = async (productId: string, alsoFavorite: boolean) => {
    const p = productMap.get(productId);
    if (alsoFavorite && p) {
      await addFav({
        product_id: p.id,
        title: p.title,
        price: p.price,
        image: p.image ?? null,
      }).catch(console.error);
    }
    await remove(productId);
    closeConfirm();
  };

  // Toplu kaldırma: opsiyonel favorile
  const handleBulkRemove = async (alsoFavorite: boolean) => {
    const ids = selectedItems.map((i) => i.product_id);
    if (ids.length === 0) {
      setBulkOpen(false);
      return;
    }

    if (alsoFavorite) {
      for (const id of ids) {
        const p = productMap.get(id);
        if (p) {
          await addFav({
            product_id: p.id,
            title: p.title,
            price: p.price,
            image: p.image ?? null,
          }).catch(console.error);
        }
      }
    }

    await removeMany(ids);
    setSelected({});
    setBulkOpen(false);
  };

  // Satın alma simülasyonu
  const onPurchase = async () => {
    if (selectedItems.length === 0) {
      alert("Satın almak için en az bir ürünü seçin.");
      return;
    }
    await removeMany(selectedItems.map((i) => i.product_id));
    setSelected({});
    alert("Satın alma işlemi başarıyla tamamlandı! 🎉");
  };

  // ⛔ Auth henüz netleşmediyse hiçbir şey gösterme (skeleton koymak istersen burası)
  if (!isHydrated) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Sepet</h1>
      </div>
    );
  }

  // 👤 Misafir ise: login'e yönlendirme YOK; sade bilgilendirme
  if (!user) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Sepet</h1>
        <p className="muted">Sepete erişmek için lütfen giriş yapınız.</p>
      </div>
    );
  }

  // Boş sepet
  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <h1>Sepet</h1>
        <p className="muted">Sepetiniz boş.</p>
        {/* Boş sepet görünümünde de Favoriler */}
        <FavoritesSection
          favs={favItems}
          removeFav={removeFavLocal}
          productMap={productMap}
          cartItems={items}
          onAddToCart={async (pid) => {
            const inCart = items.find((ci) => ci.product_id === pid);
            if (inCart) {
              await increase(pid);
            } else {
              await add({ id: pid }, 1);
            }
          }}
        />
      </div>
    );
  }

  // Tekli onay modalı için ürün detayı
  const confirmImage = confirmId ? productMap.get(confirmId)?.image : undefined;
  const confirmTitle = confirmId ? productMap.get(confirmId)?.title ?? "" : "";
  const confirmPrice = confirmId
    ? Number(productMap.get(confirmId)?.price ?? 0)
    : 0;

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

        <button
          className="btn btn--ghost"
          disabled={selectedItems.length === 0}
          onClick={() => setBulkOpen(true)}
          style={{ marginLeft: 8 }}
        >
          Seçilenleri Kaldır
        </button>

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
                const price = Number(p?.price ?? 0);
                const qty = Number(i.qty ?? 1);
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
                          alt={p?.title ?? ""}
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

                    <td>{(price * qty).toFixed(2)} ₺</td>

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

      {/* Favoriler */}
      <FavoritesSection
        favs={favItems}
        removeFav={removeFavLocal}
        productMap={productMap}
        cartItems={items}
        onAddToCart={(pid) => {
          const inCart = items.find((ci) => ci.product_id === pid);
          if (inCart) {
            increase(pid);
          } else {
            add({ id: pid }, 1);
          }
        }}
      />

      {/* Modallar */}
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

      {bulkOpen && (
        <ConfirmBulkRemoveModal
          count={selectedItems.length}
          total={selectedTotal}
          onClose={() => setBulkOpen(false)}
          onRemove={() => handleBulkRemove(false)}
          onRemoveAndFav={() => handleBulkRemove(true)}
        />
      )}
    </div>
  );
}

/* ----------------- Alt Bileşenler (aynı kaldı) ----------------- */

function FavoritesSection({
  favs,
  removeFav,
  productMap,
  cartItems,
  onAddToCart,
}: {
  favs: Record<string, { product_id: string }>;
  removeFav: (id: string) => Promise<void>;
  productMap: Map<
    string,
    { id: string; title?: string; price?: number; image?: string | null }
  >;

  cartItems: Array<{ product_id: string; qty: number }>;
  onAddToCart: (productId: string) => void;
}) {
  const list = Object.values(favs);
  if (list.length === 0) return null;

  const cartQtyMap = useMemo(
    () => new Map(cartItems.map((ci) => [ci.product_id, ci.qty])),
    [cartItems]
  );

  const formatPrice = (n: number) =>
    Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Favoriler</h2>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        {list.map((f) => {
          const p = productMap.get(f.product_id);
          const qtyInCart = cartQtyMap.get(f.product_id) ?? 0;
          const price = Number(p?.price ?? 0);

          return (
            <div
              key={f.product_id}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr auto",
                gap: 12,
                alignItems: "center",
                borderTop: "1px solid #e5e7eb",
                paddingTop: 12,
              }}
            >
              <div>
                {p?.image ? (
                  <img
                    src={p.image}
                    alt={p?.title ?? ""}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      background: "#e5e7eb",
                    }}
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontWeight: 600 }}>
                  {p?.title ?? `Ürün #${f.product_id}`}
                </div>
                <div style={{ color: "#0f766e", fontWeight: 600 }}>
                  {formatPrice(price)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => removeFav(f.product_id)}
                >
                  Kaldır
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => onAddToCart(f.product_id)}
                  title={
                    qtyInCart > 0 ? `Sepette: ${qtyInCart}` : "Sepete ekle"
                  }
                >
                  {qtyInCart > 0 ? "Sepete Ekle (+1)" : "Sepete Ekle"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .card > div[style*="grid-template-columns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
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
            <div style={{ color: "#111" }}>
              {Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(price)}
            </div>
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

function ConfirmBulkRemoveModal({
  count,
  total,
  onClose,
  onRemove,
  onRemoveAndFav,
}: {
  count: number;
  total: number;
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
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Seçilenleri Kaldır</h3>
        <p style={{ marginTop: 8, color: "#374151" }}>
          {count} ürün kaldırılacak. Toplam{" "}
          {Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 2,
          }).format(total)}
          .
          <br /> Favorilere de eklemek ister misiniz?
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <button className="btn btn--ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn--ghost" onClick={onRemove}>
            Sadece Kaldır
          </button>
          <button className="btn btn--primary" onClick={onRemoveAndFav}>
            Kaldır ve Favorilere Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
