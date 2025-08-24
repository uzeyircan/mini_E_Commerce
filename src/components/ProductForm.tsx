import { FormEvent, useEffect, useState } from "react";
import { Product, useProducts } from "@/store/product";

type Props = { edit?: Product | null; onDone?: () => void };

export default function ProductForm({ edit, onDone }: Props) {
  const add = useProducts((s) => s.add);
  const update = useProducts((s) => s.update);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (edit) {
      setTitle(edit.title);
      setPrice(edit.price);
      setImage(edit.image || "");
      setStock(edit.stock ?? "");
      setDescription(edit.description || "");
    } else {
      setTitle("");
      setPrice("");
      setImage("");
      setStock("");
      setDescription("");
    }
  }, [edit]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title || price === "" || Number(price) < 0) return;

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
    }
  }

  return (
    <form onSubmit={onSubmit} className="card form-grid">
      <div className="form-head">
        <h2 className="form-title">{edit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
        {!edit && <span className="form-hint">Zorunlu alanlar <span className="req">*</span> ile işaretlidir.</span>}
      </div>

      {/* Başlık */}
      <div className="field">
        <label className="label">
          Başlık <span className="req">*</span>
        </label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Örn: Basic T-Shirt"
        />
        <small className="help">Kısa, açıklayıcı bir isim kullanın.</small>
      </div>

      {/* Fiyat */}
      <div className="field">
        <label className="label">
          Fiyat (₺) <span className="req">*</span>
        </label>
        <div className="inputgroup">
          <span className="adorn-left">₺</span>
          <input
            className="input input--adorn-left"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
            placeholder="0.00"
          />
        </div>
        <small className="help">Ondalık için nokta/virgül kullanabilirsiniz.</small>
      </div>

      {/* Görsel URL */}
      <div className="field">
        <label className="label">Görsel URL (opsiyonel)</label>
        <input
          className="input"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
        <small className="help">CDN/Barındırma linki (Cloudinary, GitHub Raw, vb.).</small>
      </div>

      {/* Stok */}
      <div className="field">
        <label className="label">Stok (opsiyonel)</label>
        <input
          className="input"
          type="number"
          min="0"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Örn: 20"
        />
        <small className="help">Boş bırakılırsa “stok belirtilmedi” kabul edilir.</small>
      </div>

      {/* Açıklama */}
      <div className="field">
        <label className="label">Açıklama (opsiyonel)</label>
        <textarea
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ürünle ilgili kısa açıklama…"
        />
      </div>

      {/* Aksiyonlar */}
      <div className="actions">
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
