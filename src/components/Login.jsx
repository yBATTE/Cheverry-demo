import React, { useState } from "react";
import { api } from "../api.js";
export default function Login({ onLogin, admin }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [recover, setRecover] = useState(false),
    [notice, setNotice] = useState("");
  async function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (recover)
        setNotice((await api("recover", { email: data.get("email") })).message);
      else await onLogin(data.get("email"), data.get("password"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="authpage">
      <div className="eyebrow">
        {admin ? "Administración Chéverry" : "Tu espacio de aprendizaje"}
      </div>
      <h2>
        {recover
          ? "Recuperá tu acceso."
          : admin
            ? "Ingresá al panel."
            : "Volvé a tu próximo paso."}
      </h2>
      <p>
        {recover
          ? "Usá el email de tu compra para solicitar un nuevo enlace."
          : "Ingresá con tu email y contraseña para continuar."}
      </p>
      <form onSubmit={submit}>
        <label className="field">
          Correo electrónico
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="username"
          />
        </label>
        {!recover && (
          <label className="field">
            Contraseña
            <input
              name="password"
              type="password"
              required
              maxLength={128}
              autoComplete="current-password"
            />
          </label>
        )}
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        <button className="btn full" disabled={busy}>
          {busy
            ? "Procesando…"
            : recover
              ? "Enviar enlace de recuperación ↗"
              : "Ingresar ↗"}
        </button>
      </form>
      <button
        className="textlink"
        onClick={() => {
          setRecover(!recover);
          setError("");
          setNotice("");
        }}
      >
        {recover
          ? "Volver al ingreso"
          : "¿Olvidaste tu contraseña? Recuperar acceso"}
      </button>
      <p className="note">
        ¿Es tu primera vez? Cuando se apruebe el comprobante, recibirás el email
        para crear tu contraseña.
      </p>
    </section>
  );
}
