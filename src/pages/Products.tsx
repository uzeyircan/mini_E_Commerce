
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'
import { api } from '@/api'
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<string>('all')
  useEffect(() => { api<Product[]>('/products').then(setProducts).catch(console.error) }, [])
  const filtered = products.filter(p => (cat==='all'||p.category===cat) && (p.title+p.description).toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="container">
      <div className="row" style={{gap:12, marginBottom:16}}>
        <div className="brand"><span className="dot"></span> Mini E-Commerce</div>
        <div className="spacer" />
        <input className="input" placeholder="Ara..." value={query} onChange={e => setQuery(e.target.value)} />
        <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">Tümü</option><option value="electronics">Elektronik</option><option value="books">Kitap</option><option value="home">Ev</option><option value="fashion">Moda</option>
        </select>
      </div>
      <div className="grid">{filtered.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  )
}
