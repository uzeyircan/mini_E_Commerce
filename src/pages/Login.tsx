
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useAuth } from '@/store/auth'
export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState<string>('')
  const nav = useNavigate()
  const { login } = useAuth()
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    try {
      const res = await api<{token:string; email:string}>('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
      login(res.email, res.token); nav('/admin')
    } catch (e:any) { setErr(e.message || 'Hata') }
  }
  return (
    <div className="container" style={{maxWidth:520}}>
      <div className="card">
        <h2>Admin Girişi</h2>
        <form onSubmit={submit}>
          <div style={{display:'grid',gap:10}}>
            <input className="input" placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="input" placeholder="Şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            {err && <div style={{color:'#ef4444'}}>{err}</div>}
            <button className="btn" type="submit">Giriş Yap</button>
          </div>
        </form>
        <p className="muted" style={{marginTop:10}}>Varsayılan: admin@example.com / admin123 (server .env ile değiştirin)</p>
      </div>
    </div>
  )
}
