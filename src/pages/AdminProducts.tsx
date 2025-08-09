
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/types'
import { api } from '@/api'
import { clsx } from 'clsx'
import { CLOUDINARY_CLOUD, CLOUDINARY_PRESET } from '@/config'

const emptyForm: Product = { id:'', title:'', description:'', price:0, image:'', category:'electronics', stock:0, rating:0 }

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState<Product>(emptyForm)
  const [filter, setFilter] = useState('')
  async function load(){ const d = await api<Product[]>('/products'); setItems(d) }
  useEffect(()=>{ load() },[])
  function onChange<K extends keyof Product>(k:K, v:Product[K]){ setForm(f=>({ ...f, [k]: v })) }
  const isEditing = !!form.id && items.some(x=>x.id===form.id)

  async function uploadImage(file: File) {
    if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', CLOUDINARY_PRESET)
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`
      const res = await fetch(url, { method:'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Upload failed')
      return data.secure_url as string
    }
    const fd = new FormData()
    fd.append('file', file)
    const data = await api<{url:string}>('/upload', { method:'POST', body: fd })
    return data.url
  }

  async function createProduct(e: React.FormEvent){
    e.preventDefault()
    const id = form.id || 'p-' + Date.now()
    const payload: Product = { ...form, id }
    await api<Product>('/products', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
    setForm(emptyForm); await load()
  }
  async function remove(id: string){ if(!confirm('Silmek istediğinize emin misiniz?')) return; await api('/products/'+id, { method:'DELETE' }); await load() }

  const filtered = useMemo(()=> items.filter(p => (p.title+p.description).toLowerCase().includes(filter.toLowerCase())), [items, filter])

  return (
    <div className="container">
      <header className="nav">
        <div className="brand"><span className="dot"></span> Admin • Ürünler</div>
        <div className="spacer" />
        <input className="input" placeholder="Ara..." value={filter} onChange={e=>setFilter(e.target.value)} />
      </header>

      <form onSubmit={createProduct} className="card" style={{marginBottom:16}}>
        <div className="row" style={{gap:12, flexWrap:'wrap'}}>
          <input className="input" style={{flex:'1 1 240px'}} placeholder="Başlık" value={form.title} onChange={e=>onChange('title', e.target.value)} required />
          <input className="input" style={{flex:'0 1 160px'}} type="number" step="0.01" placeholder="Fiyat" value={form.price} onChange={e=>onChange('price', Number(e.target.value))} required />
          <select className="select" style={{flex:'0 1 160px'}} value={form.category} onChange={e=>onChange('category', e.target.value as Product['category'])}>
            <option value="electronics">Elektronik</option><option value="books">Kitap</option><option value="home">Ev</option><option value="fashion">Moda</option>
          </select>
          <input className="input" style={{flex:'0 1 140px'}} type="number" placeholder="Stok" value={form.stock} onChange={e=>onChange('stock', Number(e.target.value))} required />
          <input className="input" style={{flex:'0 1 140px'}} type="number" step="0.1" placeholder="Puan" value={form.rating} onChange={e=>onChange('rating', Number(e.target.value))} />
          <input className="input" style={{flex:'1 1 320px'}} placeholder="Görsel URL" value={form.image} onChange={e=>onChange('image', e.target.value)} required />
          <label className="btn ghost" style={{cursor:'pointer'}}>
            Görsel Yükle
            <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{ const f=e.target.files?.[0]; if(!f) return; const url=await uploadImage(f); onChange('image', url) }} />
          </label>
        </div>
        <textarea className="input" style={{marginTop:10, minHeight:80}} placeholder="Açıklama" value={form.description} onChange={e=>onChange('description', e.target.value)} required />
        <div className="row" style={{marginTop:10}}>
          <button className="btn" type="submit">{isEditing ? 'Ürünü Güncelle' : 'Ürün Ekle'}</button>
          {isEditing && <button type="button" className="btn ghost" onClick={()=>setForm({...emptyForm})}>Yeni Ürün</button>}
        </div>
      </form>

      <table className="table">
        <thead><tr><th style={{width:56}}></th><th>Başlık</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Puan</th><th style={{width:120}}></th></tr></thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td><img src={p.image} alt={p.title} style={{width:44, height:44, borderRadius:8, objectFit:'cover'}} /></td>
              <td style={{cursor:'pointer', textDecoration:'underline'}} onClick={()=>setForm(p)}>{p.title}</td>
              <td><span className="badge">{p.category}</span></td>
              <td>{p.price.toFixed(2)} ₺</td>
              <td>{p.stock}</td>
              <td>{p.rating.toFixed(1)}★</td>
              <td><div className="row" style={{justifyContent:'flex-end', gap:8}}><button className={clsx('btn','ghost')} onClick={()=>remove(p.id)}>Sil</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
