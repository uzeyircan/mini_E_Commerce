import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useProducts } from "@/store/product";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useComments } from "@/store/comments";
import { supabase } from "@/lib/supabase"; // ✅ EKLENDİ: stok düşürme için RPC

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const loc = useLocation();

  const { items: products, fetch: fetchProducts } = useProducts();
  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  useEffect(() => {
    if (!product) fetchProducts().catch(console.error);
  }, [product, fetchProducts]);

  const { user } = useAuth();
  const { add } = useCart();

  const comments = useComments((s) => (id ? s.items[id] ?? [] : []));
  const fetchComments = useComments((s) => s.fetch);
  const addComment = useComments((s) => s.add);
  const updateComment = useComments((s) => s.update);
  const removeComment = useComments((s) => s.remove);

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (id) fetchComments(id).catch(console.error);
  }, [id, fetchComments]);

  if (!product) {
    return (
      <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>
        <p>Ürün bulunamadı.</p>
        <button className="btn btn--ghost" onClick={() => nav(-1)}>
          Geri
        </button>
      </div>
    );
  }

  // ✅ stok bitik mi?
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  const requireAuth = () => {
    if (!user) {
      alert("Lütfen giriş yapınız / kayıt olunuz.");
      nav("/login", { state: { from: loc.pathname } });
      return true;
    }
    return false;
  };

  const handleAddToCart = () => {
    if (requireAuth()) return;
    if (isOutOfStock) {
      alert("Bu ürün stokta olmadığı için sepete eklenemez.");
      return;
    }
    add({ id: product.id, title: product.title, price: product.price }, 1);
    setBounce(true);
    setTimeout(() => setBounce(false), 300);
  };

  // ✅ SATIN AL → stok 1 düşür, ardından ürünleri yenile
  const handleBuyNow = async () => {
    if (requireAuth()) return;
    if (isOutOfStock) {
      alert("Ürün stokta yok.");
      return;
    }

    // Supabase RPC: decrement_stock(p_id uuid, p_qty integer)
    const { error } = await supabase.rpc("decrement_stock", {
      p_id: product.id,
      p_qty: 1,
    });

    if (error) {
      console.error(error);
      alert("Satın alma sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
      return;
    }

    // Yeniden yükleyelim ki anlık stok güncellensin
    await fetchProducts().catch(console.error);
    alert("Satın alma işlemi başarıyla tamamlandı! 🎉");
  };

  // ✅ stok bittiğinde görünen “Geldiğinde haber ver”
  const handleNotifyMe = () => {
    if (requireAuth()) return;
    // demo
    alert(
      "Bildirim isteği alındı. Stok eklendiğinde e-posta ile haberdar edeceğiz. (Demo)"
    );
  };

  const canEditOrDelete = (authorEmail?: string) =>
    !!user &&
    ((!!authorEmail && user.email === authorEmail) || user.role === "admin");

  const onAddComment = async () => {
    if (requireAuth()) return;
    if (!text.trim()) return;
    await addComment(product.id, text.trim());
    setText("");
  };

  const onStartEdit = (cid: string, curr: string) => {
    setEditingId(cid);
    setEditText(curr);
  };

  const onSaveEdit = async (cid: string) => {
    if (!editText.trim()) return;
    await updateComment(product.id, cid, editText.trim());
    setEditingId(null);
    setEditText("");
  };

  const onDelete = async (cid: string) => {
    if (!confirm("Yorumu silmek istiyor musunuz?")) return;
    await removeComment(product.id, cid);
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
      <nav style={{ fontSize: 14 }}>
        <Link to="/" className="muted">
          ← Mağaza
        </Link>
      </nav>

      {/* Ürün */}
      <div className="card" style={{ display: "grid", gap: 16 }}>
        <div
          style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Sol görsel */}
          <div>
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                style={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                  borderRadius: 12,
                  background: "#f8fafc",
                }}
              />
            ) : (
              <div
                style={{
                  height: 320,
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
          </div>

          {/* Sağ bilgi */}
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <h1 style={{ margin: 0 }}>{product.title}</h1>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {product.price.toFixed(2)} ₺
            </div>
            {typeof product.stock === "number" && (
              <div className="muted">Stok: {product.stock}</div>
            )}
            {product.description ? (
              <p style={{ color: "#111", lineHeight: 1.6 }}>
                {product.description}
              </p>
            ) : (
              <p className="muted">Açıklama eklenmemiş.</p>
            )}

            {/* Aksiyonlar */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                className={`btn btn--ghost ${bounce ? "button-bounce" : ""}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                Sepete Ekle
              </button>

              {/* ✅ Stok durumuna göre buton değişiyor */}
              {isOutOfStock ? (
                <button className="btn btn--primary" onClick={handleNotifyMe}>
                  Geldiğinde haber ver
                </button>
              ) : (
                <button className="btn btn--buy" onClick={handleBuyNow}>
                  Satın Al
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Yorumlar */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0, textAlign: "center" }}>Yorumlar</h2>

        {/* Ekleme */}
        <div
          style={{ display: "grid", gap: 8, maxWidth: 720, margin: "0 auto" }}
        >
          {!user ? (
            <p className="muted" style={{ textAlign: "center" }}>
              Yorum yapmak için giriş yapınız.
            </p>
          ) : (
            <>
              <textarea
                className="ui-textarea comment-fixed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ürün hakkında düşüncelerinizi yazın…"
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="btn btn--primary"
                  onClick={onAddComment}
                  disabled={!text.trim()}
                >
                  Yorum Gönder
                </button>
              </div>
            </>
          )}
        </div>

        {/* Liste */}
        <div
          style={{ display: "grid", gap: 10, maxWidth: 720, margin: "0 auto" }}
        >
          {comments.length === 0 ? (
            <p className="muted" style={{ textAlign: "center" }}>
              Henüz yorum yok.
            </p>
          ) : (
            comments.map((c) => {
              const mine = canEditOrDelete(c.author_email);
              return (
                <div
                  key={c.id}
                  style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {c.author_name || c.author_email || "Kullanıcı"}
                      <span
                        className="muted"
                        style={{ marginLeft: 8, fontSize: 12 }}
                      >
                        {new Date(c.created_at).toLocaleString()}
                        {c.updated_at ? " (düzenlendi)" : ""}
                      </span>
                    </div>
                    {mine && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {editingId === c.id ? (
                          <>
                            <button
                              className="btn btn--ghost"
                              onClick={() => onSaveEdit(c.id)}
                              disabled={!editText.trim()}
                            >
                              Kaydet
                            </button>
                            <button
                              className="btn btn--ghost"
                              onClick={() => {
                                setEditingId(null);
                                setEditText("");
                              }}
                            >
                              İptal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn--ghost"
                              onClick={() => onStartEdit(c.id, c.text)}
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn--primary"
                              onClick={() => onDelete(c.id)}
                            >
                              Sil
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingId === c.id ? (
                    <textarea
                      className="ui-textarea comment-fixed"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{ marginTop: 8 }}
                    />
                  ) : (
                    <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                      {c.text}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
