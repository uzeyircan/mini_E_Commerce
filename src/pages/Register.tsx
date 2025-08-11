
import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: backend kayıt
    nav("/login");
  }

  return (
    <div className="authwrap">
      <form className="authcard" onSubmit={onSubmit}>
        <h1>Kayıt Ol</h1>
        <label>E-posta
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </label>
        <label>Şifre
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
        </label>
        <button className="btn btn--primary" type="submit">Kayıt Ol</button>
        <p className="muted">Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link></p>
      </form>
    </div>
  );
}
