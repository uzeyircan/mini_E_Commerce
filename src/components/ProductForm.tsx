// src/components/ProductForm.tsx
import { FormEvent, useEffect, useState } from "react";
import { Product, useProducts } from "@/store/product";
import { useCategories } from "@/store/category";

type Props = { edit?: Product | null; onDone?: () => void };

export default function ProductForm({ edit, onDone }: Props) {
  // products store
  const add = useProducts((s) => s.add);
  const update = useProducts((s) => s.update);
  const fetchProducts = useProducts((s) => s.fetch); // insert sonrası listeyi yenilemek için

  // categories store
  const fetchCats = useCategories((s) => s.fetch);
  const ensureCat = useCategories((s) => s.ensureByName);
  const cats = useCategories((s) => s.items);

  // form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // Kategori önerileri (datalist) için
  useEffect(() => {
    fetchCats().catch(console.error);
  }, [fetchCats]);

  // Edit modunda formu doldur
  useEffect(() => {
    if (edit) {
      setTitle(edit.title);
      setPrice(edit.price);
      setImage(edit.image || "");
      setStock(edit.stock ?? "");
      setDescription(edit.description || "");
      const nameFromJoin = edit.category_name || "";
      const nameFromId = edit.category_id
        ? cats[edit.category_id]?.name || ""
        : "";
      setCategoryName(nameFromJoin || nameFromId);
    } else {
      setTitle("");
      setPrice("");
      setImage("");
      setStock("");
      setDescription("");
      setCategoryName("");
    }
  }, [edit, cats]);

  const submitDisabled =
    loading || !title.trim() || price === "" || Number(price) < 0;

  // Form submit yerine buton tıklamasıyla yönetiyoruz (daha deterministik)
  async function handleSave(e?: FormEvent) {
    e?.preventDefault();

    if (loading) return; // çifte tıklama kilidi
    if (submitDisabled) return;

    // Kategori id’sini garanti et (yeni isimse oluştur)
    let category_id: string | null = null;
    if (categoryName.trim()) {
      try {
        category_id = await ensureCat(categoryName.trim());
      } catch (err) {
        console.error(err);
        alert("Kategori oluşturulurken hata oluştu.");
        return;
      }
    }

    const payload: Omit<Product, "id"> = {
      title: title.trim(),
      price: Number(price),
      image: image.trim() || null,
      stock: stock === "" ? null : Number(stock),
      description: description.trim() || null,
      category_id,
    };

    setLoading(true);

    // Güvenlik zamanlayıcı: olası takılmalarda yüklemeyi düşür
    const safety = setTimeout(() => {
      setLoading(false);
      alert("İstek gecikti. Lütfen tekrar deneyin.");
    }, 8000);

    try {
      if (edit) {
        await update(edit.id, payload);
      } else {
        await add(payload);
        // Bazı ortamlarda insert sonrası satır dönmeyebilir; listeyi zorunlu tazele
        await fetchProducts();
        // yeni kayıt akışında formu temizle
        setTitle("");
        setPrice("");
        setImage("");
        setStock("");
        setDescription("");
        setCategoryName("");
      }
      onDone?.();
    } catch (err: any) {
      console.error("ProductForm save error:", err);
      alert(err?.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      clearTimeout(safety);
      setLoading(false);
    }
  }

  return (
    // noValidate: tarayıcı HTML5 doğrulaması submit’i sessizce engellemesin
    <form className="card form-grid" noValidate>
      <div className="form-head">
        <h2 className="form-title">
          {edit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        </h2>
        {!edit && (
          <span className="form-hint">
            Zorunlu alanlar <span className="req">*</span> ile işaretlidir.
          </span>
        )}
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
            placeholder="0.00"
          />
        </div>
        <small className="help">
          Ondalık için nokta/virgül kullanabilirsiniz.
        </small>
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
        <small className="help">
          CDN/Barındırma linki (Cloudinary, GitHub Raw, vb.).
        </small>
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
        <small className="help">
          Boş bırakılırsa “stok belirtilmedi” kabul edilir.
        </small>
      </div>

      {/* Kategori (serbest yazılabilir + datalist) */}
      <div className="field">
        <label className="label">Kategori</label>
        <input
          id="cat"
          list="category-list"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Örn: Üst Giyim"
          className="input"
        />
        <datalist id="category-list">
          {Object.values(cats).map((c) => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
        <small className="help">
          Yeni bir isim yazarsan otomatik oluşturulur; mevcutsa o kategoriye
          eklenir.
        </small>
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

      {/* Aksiyonlar (tek buton, tıklama ile kaydet) */}
      <div
        className="actions"
        style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
      >
        {onDone && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onDone}
            disabled={loading}
          >
            İptal
          </button>
        )}
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSave}
          disabled={submitDisabled}
        >
          {loading
            ? edit
              ? "Kaydediliyor…"
              : "Ekleniyor…"
            : edit
            ? "Kaydet"
            : "Ekle"}
        </button>
      </div>
    </form>
  );
}
