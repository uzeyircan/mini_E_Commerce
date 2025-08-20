import { FormEvent, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      const from = (loc.state as any)?.from ?? "/";
      nav(from, { replace: true });
    } catch (err: any) {
      alert(err?.message || "Giriş başarısız");
    }
  }

  return (
    <div className="authwrap">
      <form className="authcard" onSubmit={onSubmit}>
        <h1>Giriş Yap</h1>
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
          Giriş Yap
        </button>
        <p className="muted">
          Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
        </p>
      </form>
    </div>
  );
}
