import { FormEvent, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import "./auth.css";

export default function Register() {
  const nav = useNavigate();
  const loc = useLocation();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await register(email, password);
      const from = (loc.state as any)?.from ?? "/";
      nav(from, { replace: true });
    } catch (err: any) {
      alert(err?.message || "Kayıt başarısız");
    }
  }

  return (
    <div className="authwrap">
      <form className="authcard" onSubmit={onSubmit}>
        <h1>Kayıt Ol</h1>
        <label>
          E-posta
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label>
          Şifre
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        <button className="btn btn--primary" type="submit">
          Kayıt Ol
        </button>
        <p className="muted">
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
}
