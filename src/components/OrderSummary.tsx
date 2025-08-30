interface Props {
  itemCount: number;
  totalQty: number;
  subtotal: number;
  onCheckout?: () => void;
  onRemoveSelected?: () => void;
  selectedCount?: number;
}

export default function OrderSummary({
  itemCount, totalQty, subtotal, onCheckout, onRemoveSelected, selectedCount = 0
}: Props) {
  return (
    <aside className="card order-summary">
      <h3>Sipariş Özeti</h3>
      <div className="summary-row"><span>Ürün Çeşidi</span><span>{itemCount}</span></div>
      <div className="summary-row"><span>Toplam Adet</span><span>{totalQty}</span></div>
      <div className="summary-row"><span>Ara Toplam</span><span>{subtotal.toFixed(2)} ₺</span></div>

      <button className="btn primary w-full" onClick={onCheckout}>Satın Al</button>
      <button
        className="btn w-full"
        disabled={!selectedCount}
        onClick={onRemoveSelected}
        style={{ marginTop: 8 }}
      >
        Seçilenleri Kaldır ({selectedCount})
      </button>
    </aside>
  );
}
