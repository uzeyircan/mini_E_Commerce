import { FormEvent, useEffect, useMemo, useState } from "react";
import { Product, useProducts } from "@/store/product";

type Props = { edit?: Product | null; onDone?: () => void };

function isValidUrl(s: string) {
  const v = s.trim();
  if (!v) return true; // opsiyonel
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProductForm({ edit, onDone }: Props) {
  const add = useProducts((s) => s.add);
  const update = useProducts((s) => s.update);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // alan bazlı hafif doğrulama (sadece görsel amaçlı)
  const [err, setErr] = useState<{
    title?: string;
    price?: string;
    image?: string;
    stock?: string;
  }>({});

  // Görsel önizleme (debounce)
  const previewUrl = useMemo(() => image.trim(), [image]);

  useEffect(() => {
    if (edit) {
      setTitle(edit.title);
      setPrice(edit.price);
      setImage(edit.image || "");
      setStock(edit.stock ?? "");
      setDescription(edit.description || "");
      setErr({});
    } else {
      setTitle("");
      setPrice("");
      setImage("");
      setStock("");
      setDescription("");
      setErr({});
    }
  }, [edit]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    // hafif alan kontrolü
    const nextErr: typeof err = {};
    if (!title.trim()) nextErr.title = "Başlık zorunludur.";
    if (price === "" || Number(price) < 0)
      nextErr.price = "Geçerli bir fiyat girin.";
    if (!isValidUrl(image))
      nextErr.image = "Geçerli bir URL girin (https/ http).";
    if (stock !== "" && Number(stock) < 0)
      nextErr.stock = "Stok negatif olamaz.";
    setErr(nextErr);
    if (Object.keys(nextErr).length) return;

    const payload = {
      title: title.trim(),
      price: Number(price),
      image: image.trim() || undefined,
      stock: stock === "" ? undefined : Number(stock),
      description: description.trim() || undefined,
    };

    if (edit) update(edit.id, payload);
    else add(payload);

    onDone?.();

    if (!edit) {
      setTitle("");
      setPrice("");
      setImage("");
      setStock("");
      setDescription("");
      setErr({});
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card"
      style={{ display: "grid", gap: 12 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <h2 style={{ margin: 0 }}>
          {edit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        </h2>
        <span className="muted" style={{ fontSize: 12 }}>
          Zorunlu alanlar <span style={{ color: "#ef4444" }}>*</span> ile
          işaretlidir.
        </span>
      </div>

      {/* Başlık */}
      <label className="field">
        <span className="label">
          Başlık <span className="req">*</span>
        </span>
        <input
          className="ui-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn: Basic T-Shirt"
          aria-invalid={!!err.title}
          aria-describedby={err.title ? "err_title" : undefined}
          required
        />
        <div className="hint">Kısa, açıklayıcı bir isim kullanın.</div>
        {err.title && (
          <div id="err_title" className="error">
            {err.title}
          </div>
        )}
      </label>

      {/* Fiyat */}
      <label className="field">
        <span className="label">
          Fiyat (₺) <span className="req">*</span>
        </span>
        <div className="input-addon ui-input" aria-invalid={!!err.price}>
          <span className="addon" style={{ padding: "0 15px" }}>
            ₺
          </span>
          <input
            className="ui-input u-pad-left"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()} // scroll ile değer değişmesin
            required
          />
        </div>
        <div className="hint">Ondalık için nokta/virgül kullanabilirsiniz.</div>
        {err.price && <div className="error">{err.price}</div>}
      </label>

      {/* Görsel URL + Önizleme */}
      <div className="field">
        <label className="label">Görsel URL (opsiyonel)</label>
        <input
          className="ui-input"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          aria-invalid={!!err.image}
          aria-describedby={err.image ? "err_image" : undefined}
        />
        <div className="hint">
          Barındırma/CDN linki (örn. Cloudinary, GitHub Raw, vb.).
        </div>
        {err.image && (
          <div id="err_image" className="error">
            {err.image}
          </div>
        )}
        {previewUrl && isValidUrl(previewUrl) && (
          <div className="preview">
            <img src={previewUrl} alt="Önizleme" />
            <span className="muted" style={{ fontSize: 12 }}>
              Önizleme
            </span>
          </div>
        )}
      </div>

      {/* Stok */}
      <label className="field">
        <span className="label">Stok (opsiyonel)</span>
        <input
          className="ui-input"
          type="number"
          min="0"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value === "" ? "" : Number(e.target.value))
          }
          onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
          aria-invalid={!!err.stock}
          aria-describedby={err.stock ? "err_stock" : undefined}
        />
        <div className="hint">
          Boş bırakılırsa “stok belirtilmedi” kabul edilir.
        </div>
        {err.stock && (
          <div id="err_stock" className="error">
            {err.stock}
          </div>
        )}
      </label>

      {/* Açıklama */}
      <label className="field">
        <span className="label">Açıklama (opsiyonel)</span>
        <textarea
          className="ui-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ürünle ilgili kısa açıklama..."
        />
      </label>

      {/* Aksiyonlar */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onDone && (
          <button type="button" className="btn btn--ghost" onClick={onDone}>
            İptal
          </button>
        )}
        <button className="btn btn--primary" type="submit">
          {edit ? "Kaydet" : "Ekle"}
        </button>
      </div>
    </form>
  );
}
