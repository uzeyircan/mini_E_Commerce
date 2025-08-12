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
    if (edit) {
      update(edit.id, payload);
    } else {
      add(payload);
    }
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
    <form
      onSubmit={onSubmit}
      className="card"
      style={{ display: "grid", gap: 12 }}
    >
      <h2 style={{ margin: 0 }}>{edit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
      <label>
        Başlık
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Örn: Basic T-Shirt"
        />
      </label>
      <label>
        Fiyat (₺)
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          required
        />
      </label>
      <label>
        Görsel URL (opsiyonel)
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
        />
      </label>
      <label>
        Stok (opsiyonel)
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </label>
      <label>
        Açıklama (opsiyonel)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
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
