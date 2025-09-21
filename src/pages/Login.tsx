import { FormEvent, useState } from "react";
import { useAuth } from "@/store/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const login = useAuth((s) => s.login);
  const sendReset = useAuth((s) => s.sendResetEmail);
  const { user } = useAuth();

  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    if (useAuth.getState().user) {
      const from = (loc.state as any)?.from || "/";
      nav(from, { replace: true });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card"
      style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}
    >
      <h2>Giriş Yap</h2>
      <input
        className="input"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input"
        placeholder="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            if (!email.trim()) return alert("Lütfen e-posta giriniz.");
            sendReset(email);
          }}
        >
          Şifremi Unuttum
        </button>
      </div>

      <p style={{ marginTop: 12 }}>
        Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
      </p>

      {user?.role === "admin" && (
        <p className="muted" style={{ marginTop: 8 }}>
          Admin olarak giriş yaptığında profilinden panele geçebilirsin.
        </p>
      )}
    </form>
  );
}
