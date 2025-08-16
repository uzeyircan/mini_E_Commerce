import { useParams, Link, useNavigate } from "react-router-dom";
import { useProducts } from "@/store/product";
import { useAuth } from "@/store/auth";
import { useComments } from "@/store/comments";
import { useMemo, useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { items: products } = useProducts();
  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  const { user } = useAuth();
  const comments = useComments((s) => (id ? s.items[id] ?? [] : []));
  const addComment = useComments((s) => s.add);
  const updateComment = useComments((s) => s.update);
  const removeComment = useComments((s) => s.remove);

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

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

  const canEditOrDelete = (authorEmail: string) =>
    !!user && (user.email === authorEmail || user.role === "admin");

  const onAdd = () => {
    if (!user) {
      alert("Yorum yapabilmek için giriş yapınız.");
      return;
    }
    if (!text.trim()) return;
    addComment({
      productId: product.id,
      authorEmail: user.email,
      authorName: user.email.split("@")[0],
      text: text.trim(),
    });
    setText("");
  };

  const onStartEdit = (id: string, curr: string) => {
    setEditingId(id);
    setEditText(curr);
  };

  const onSaveEdit = (cid: string) => {
    if (!editText.trim()) return;
    updateComment(product.id, cid, editText.trim());
    setEditingId(null);
    setEditText("");
  };

  const onDelete = (cid: string) => {
    if (!confirm("Yorumu silmek istiyor musunuz?")) return;
    removeComment(product.id, cid);
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

      <div
        className="card"
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1fr",
          alignItems: "start",
        }}
      >
        {/* Üst: görsel solda, metin sağda (desktop'ta iki kolon) */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "1fr",
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 16 }}>
              {/* responsive 2 kolon */}
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "1fr",
                }}
              >
                <div style={{ display: "grid", gap: 16 }}>
                  <div
                    style={{
                      display: "grid",
                      gap: 16,
                      gridTemplateColumns: "1fr",
                    }}
                  >
                    {/* wrapper */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive iki kolon */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "1fr",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}
        />

        {/* Asıl layout */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}
        />

        {/* Desktop 2 kolon */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}
        />

        {/* gerçek içerik */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}
        />

        {/* İçeriği sade yazalım */}
        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "1fr",
            }}
          />
        </div>

        {/* Nihai iki kolon */}
        <div
          style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Sol: Görsel */}
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

          {/* Sağ: Başlık + açıklama */}
          <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
            <h1 style={{ margin: 0 }}>{product.title}</h1>
            {product.description ? (
              <p style={{ color: "#111", lineHeight: 1.6 }}>
                {product.description}
              </p>
            ) : (
              <p className="muted">Açıklama eklenmemiş.</p>
            )}
          </div>
        </div>
      </div>

      {/* Yorumlar */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0, textAlign: "center" }}>Yorumlar</h2>

        {/* Yorum ekleme */}
        <div
          style={{
            display: "grid",
            gap: 8,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {!user ? (
            <p className="muted" style={{ textAlign: "center" }}>
              Yorum yapmak için giriş yapınız.
            </p>
          ) : (
            <>
              <textarea
                className="ui-textarea comment-fixed"
                maxLength={500}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Ürün hakkında düşüncelerinizi yazın… (En fazla 500 karakter)"
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="btn btn--primary"
                  onClick={onAdd}
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
              const mine = canEditOrDelete(c.authorEmail);
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
                      {c.authorName || c.authorEmail}
                      <span
                        className="muted"
                        style={{ marginLeft: 8, fontSize: 12 }}
                      >
                        {new Date(c.createdAt).toLocaleString()}
                        {c.updatedAt ? " (düzenlendi)" : ""}
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
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Ürün hakkında düşüncelerinizi yazın… (En fazla 500 karakter)"
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
