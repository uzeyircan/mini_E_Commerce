// src/pages/Register.tsx
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
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Basit istemci doğrulaması
    if (!email.trim()) return alert("Lütfen e-posta giriniz.");
    if (!password || password.length < 6)
      return alert("Şifre en az 6 karakter olmalı.");

    setLoading(true);
    try {
      // Store içindeki register; e-posta zaten kayıtlıysa kendi uyarısını verir
      await register(email, password);

      // Kayıt sonrası: Eğer doğrulama açıksa session dönmez -> user null kalır.
      const authState = useAuth.getState();
      if (!authState.user) {
        nav("/login", {
          replace: true,
          state: {
            info: "Kayıt başarılı. Lütfen e-posta kutunu (Spam/Junk dâhil) kontrol ederek hesabını doğrula.",
          },
        });
        return;
      }

      // Doğrulama kapalıysa (veya hemen session kurulduysa) geldiği sayfaya git
      const from = (loc.state as any)?.from ?? "/";
      nav(from, { replace: true });
    } catch (err: any) {
      // Yedek hata yakalama
      alert(err?.message || "Kayıt işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authwrap">
      <form className="authcard" onSubmit={onSubmit} noValidate>
        <h1>Kayıt Ol</h1>

        <label>
          E-posta
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            placeholder="ornek@site.com"
          />
        </label>

        <label>
          Şifre
          <div className="inputgroup">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="En az 6 karakter"
              className="input input--adorn-right"
            />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
              style={{ whiteSpace: "nowrap" }}
            >
              {showPw ? "Gizle" : "Göster"}
            </button>
          </div>
        </label>

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "Kaydediliyor…" : "Kayıt Ol"}
        </button>

        <p className="muted" style={{ marginTop: 12 }}>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
}
