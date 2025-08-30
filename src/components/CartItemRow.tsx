import { Product } from "@/store/product";

export interface CartRow {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
  // varsa varyant vs. eklenir
}

interface Props {
  item: CartRow;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItemRow({
  item,
  selected,
  onSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const lineTotal = item.price * item.qty;

  return (
    <div className="tr">
      <div className="cell select">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
        />
      </div>
      <div className="cell product">
        <img src={item.image} alt={item.title} />
        <div className="title">{item.title}</div>
      </div>
      <div className="cell price">{item.price.toFixed(2)} ₺</div>
      <div className="cell qty">
        <button className="qty-btn" onClick={onDecrease}>
          -
        </button>
        <span>{item.qty}</span>
        <button className="qty-btn" onClick={onIncrease}>
          +
        </button>
      </div>
      <div className="cell subtotal">{lineTotal.toFixed(2)} ₺</div>
      <div className="cell actions">
        <button className="link danger" onClick={onRemove}>
          Sil
        </button>
      </div>
    </div>
  );
}
