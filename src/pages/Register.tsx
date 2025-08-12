<<<<<<< HEAD
import { FormEvent, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
=======

import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
import "./auth.css";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const loc = useLocation();
=======
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: backend kayıt
<<<<<<< HEAD
    // Kayıttan sonra login sayfasına, from bilgisini koruyarak git
    const from = (loc.state as any)?.from ?? "/";
    nav("/login", { state: { from } });
=======
    nav("/login");
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
  }

  return (
    <div className="authwrap">
      <form className="authcard" onSubmit={onSubmit}>
        <h1>Kayıt Ol</h1>
<<<<<<< HEAD
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
=======
        <label>E-posta
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </label>
        <label>Şifre
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
        </label>
        <button className="btn btn--primary" type="submit">Kayıt Ol</button>
        <p className="muted">Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link></p>
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
      </form>
    </div>
  );
}
