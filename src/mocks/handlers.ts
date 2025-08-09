
import { http, HttpResponse } from 'msw'
import type { Product, Coupon } from '@/types'
let products: Product[] = [
  { id:'p-001', title:'Wireless Noise-Canceling Headphones', description:'40h battery, ANC, Bluetooth 5.3.', price:2799.90, image:'https://images.unsplash.com/photo-1518441902110-9d7d6900d0d4?q=80&w=1200&auto=format&fit=crop', category:'electronics', stock:42, rating:4.6 },
  { id:'p-002', title:'Ergonomic Office Chair', description:'Adjustable lumbar support, breathable mesh.', price:3999.00, image:'https://images.unsplash.com/photo-1582582621959-48d3ae7f3c71?q=80&w=1200&auto=format&fit=crop', category:'home', stock:18, rating:4.4 },
  { id:'p-003', title:'TypeScript in Depth (2nd Ed.)', description:'From generics to advanced patterns.', price:749.50, image:'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop', category:'books', stock:120, rating:4.8 },
  { id:'p-004', title:'Minimalist Hoodie', description:'Heavyweight fleece, unisex fit.', price:899.00, image:'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?q=80&w=1200&auto=format&fit=crop', category:'fashion', stock:64, rating:4.2 }
]
const coupons: Coupon[] = [
  { code:'SAVE10', kind:'percent', value:10, description:'%10 indirim (minimum yok)' },
  { code:'TRY50', kind:'amount', value:50, minSubtotal:300, description:'300₺ üzeri 50₺ indirim' },
  { code:'FREESHIP', kind:'shipping', value:0, description:'Kargo bedava' },
]
export const handlers = [
  http.get('/api/products', () => HttpResponse.json(products)),
  http.get('/api/coupons', () => HttpResponse.json(coupons)),
]
