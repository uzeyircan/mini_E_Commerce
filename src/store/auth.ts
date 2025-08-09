
import { create } from 'zustand'
type User = { email: string } | null
type State = { user: User; token: string | null }
type Actions = { login:(email:string,token:string)=>void; logout:()=>void }
const KEY='auth_v1'
function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null') }catch{ return null } }
function write(d:any){ localStorage.setItem(KEY, JSON.stringify(d)) }
export const useAuth = create<State & Actions>((set)=> ({
  user: read()?.user ?? null, token: read()?.token ?? null,
  login:(email,token)=> set(()=>{ const n={user:{email},token}; write(n); return n }),
  logout:()=> set(()=>{ const n={user:null, token:null}; write(n); return n })
}))
export function getToken(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null')?.token ?? null }catch{ return null } }
