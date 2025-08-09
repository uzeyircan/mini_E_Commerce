
import { create } from 'zustand'
import type { CartItem, Coupon } from '@/types'
type State = { items: CartItem[]; coupon?: Coupon; shipping: number }
type Actions = { add:(i:CartItem)=>void; remove:(id:string)=>void; setQty:(id:string,qty:number)=>void; clear:()=>void; applyCoupon:(c?:Coupon)=>void }
const INITIAL_SHIPPING=49.90
export const useCart = create<State & Actions>((set)=> ({
  items:[], coupon:undefined, shipping:INITIAL_SHIPPING,
  add:(item)=> set(s=>{ const e=s.items.find(x=>x.id===item.id); if(e){ return { items: s.items.map(x=>x.id===item.id?{...x,qty:x.qty+item.qty}:x ) } } return { items:[...s.items,item] } }),
  remove:(id)=> set(s=>({ items: s.items.filter(x=>x.id!==id) })),
  setQty:(id,qty)=> set(s=>({ items: s.items.map(x=>x.id===id?{...x,qty:Math.max(1,qty)}:x) })),
  clear:()=> set({ items:[], coupon:undefined, shipping:INITIAL_SHIPPING }),
  applyCoupon:(coupon)=> set({ coupon, shipping: coupon?.kind==='shipping'?0:INITIAL_SHIPPING })
}))
export function subtotal(){ return useCart.getState().items.reduce((s,i)=> s + i.price*i.qty, 0) }
export function discountTotal(){ const st=subtotal(); const c=useCart.getState().coupon; if(!c) return 0; if(c.kind==='percent') return st*(c.value/100); if(c.kind==='amount') return st >= (c.minSubtotal??0) ? c.value : 0; return 0 }
export function grandTotal(){ const st=subtotal(); const disc=discountTotal(); const ship=useCart.getState().shipping; return Math.max(0, st-disc) + (st>0?ship:0) }
