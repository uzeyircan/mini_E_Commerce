
import { useEffect, useMemo, useState } from 'react'
import { useCart, subtotal, discountTotal, grandTotal } from '@/store/cart'
import type { Coupon } from '@/types'
import { api } from '@/api'
export default function CartPage() {
  const { items, remove, setQty, clear, coupon, applyCoupon, shipping } = useCart()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [code, setCode] = useState('')
  useEffect(() => { api<Coupon[]>('/coupons').then(setCoupons).catch(console.error) }, [])
  const found = useMemo(() => coupons.find(c => c.code.toLowerCase() === code.trim().toLowerCase()), [code, coupons])
  const sub = subtotal(); const disc = discountTotal(); const total = grandTotal()
  return (
    <div className="container">
      <header className="nav"><div className="brand"><span className="dot"></span> Sepet</div></header>
      {items.length === 0 ? (<p className="muted">Sepetiniz boş. Ürünleri eklemeye başlayın!</p>) : (<>
        <table className="table"><thead><tr><th>Ürün</th><th>Fiyat</th><th>Adet</th><th>Ara Toplam</th><th></th></tr></thead>
          <tbody>{items.map(it => (<tr key={it.id}>
            <td className="row" style={{gap:12}}><img src={it.image} alt={it.title} style={{width:56,height:56,borderRadius:8,objectFit:'cover'}} /><div>{it.title}</div></td>
            <td>{it.price.toFixed(2)} ₺</td>
            <td><input className="input" type="number" min={1} style={{width:72}} value={it.qty} onChange={e => setQty(it.id, parseInt(e.target.value || '1'))} /></td>
            <td>{(it.price * it.qty).toFixed(2)} ₺</td>
            <td><button className="btn ghost" onClick={() => remove(it.id)}>Kaldır</button></td>
          </tr>))}</tbody></table>
        <div className="coupon">
          <input className="input" placeholder="Kupon kodu (SAVE10, TRY50, FREESHIP)" value={code} onChange={e => setCode(e.target.value)} />
          <button className="btn" onClick={() => applyCoupon(found!)} disabled={!found}>Uygula</button>
          {coupon && <button className="btn ghost" onClick={() => applyCoupon(undefined)}>Kuponu Kaldır</button>}
        </div>
        <div className="totals">
          <div className="row"><div>Ara toplam</div><div className="spacer" /><strong>{sub.toFixed(2)} ₺</strong></div>
          <div className="row"><div>İndirim</div><div className="spacer" /><strong>-{disc.toFixed(2)} ₺</strong></div>
          <div className="row"><div>Kargo</div><div className="spacer" /><strong>{sub>0 ? shipping.toFixed(2) : '0.00'} ₺</strong></div>
          <div className="row" style={{marginTop:8,fontSize:'1.1rem'}}><div>Genel Toplam</div><div className="spacer" /><strong>{total.toFixed(2)} ₺</strong></div>
          <div className="row" style={{marginTop:12}}><button className="btn" onClick={() => alert('Demo: Ödeme akışı burada olurdu.')}>Güvenli Ödeme</button><div className="spacer" /><button className="btn ghost" onClick={clear}>Sepeti Temizle</button></div>
        </div>
      </>)}
    </div>
  )
}
