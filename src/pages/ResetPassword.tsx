// src/pages/ResetPassword.tsx
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1) code varsa session'a çevir, yoksa mevcut session var mı bak
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const type = url.searchParams.get("type");

        if (code && type === "recovery") {
          // query paramlı akış
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setCanReset(true);
        } else {
          // hash'li akış (access_token # ile gelir)
          const { data } = await supabase.auth.getSession();
          // type=recovery geldiğinde session dolu olur
          setCanReset(!!data.session);
        }
      } catch (e) {
        console.error(e);
        setCanReset(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canReset) {
      alert("Şifre sıfırlama kodu bulunamadı.");
      return;
    }
    if (password.length < 6) {
      alert("Şifre en az 6 karakter olmalı.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      alert("Şifreniz güncellendi. Lütfen tekrar giriş yapın.");
      nav("/login", { replace: true, state: { info: "Şifre güncellendi." } });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Şifre güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>Yeni Şifre</h1>

      {loading ? (
        <p className="muted">Hazırlanıyor…</p>
      ) : !canReset ? (
        <div className="card">
          <p>
            Şifre sıfırlama kodu bulunamadı. Lütfen e-postanızdaki bağlantıya
            tıklayarak bu sayfaya gelin veya tekrar{" "}
            <a href="/login">şifre sıfırlama</a> isteyin.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ gap: 12 }}>
          <input
            className="input"
            type="password"
            placeholder="Yeni şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            minLength={6}
          />
          <button className="btn btn--primary" disabled={loading} type="submit">
            {loading ? "Güncelleniyor…" : "Şifreyi Güncelle"}
          </button>
        </form>
      )}
    </div>
  );
}
