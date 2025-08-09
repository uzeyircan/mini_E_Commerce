
export type Product = {
  id: string; title: string; description: string;
  price: number; image: string;
  category: 'electronics'|'books'|'home'|'fashion';
  stock: number; rating: number;
}
export type CartItem = { id: string; title: string; price: number; image: string; qty: number }
export type Coupon = { code: string; kind: 'percent'|'amount'|'shipping'; value: number; minSubtotal?: number; description: string }
