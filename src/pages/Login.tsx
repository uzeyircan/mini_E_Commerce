
import { FormEvent, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import "./auth.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: backend entegrasyonu
    const role = email === "admin@example.com" ? "admin" as const : "user";
    login({ id: "u1", email, role }, "demo-token");
    const redirect = (loc.state as any)?.from ?? "/";
    nav(redirect);
  }

  return (
    <div className="authwrap">
      <form className="authcard" onSubmit={onSubmit}>
        <h1>Giriş Yap</h1>
        <label>E-posta
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </label>
        <label>Şifre
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
        </label>
        <button className="btn btn--primary" type="submit">Giriş Yap</button>
        <p className="muted">Hesabın yok mu? <Link to="/register">Kayıt Ol</Link></p>
      </form>
    </div>
  );
}
