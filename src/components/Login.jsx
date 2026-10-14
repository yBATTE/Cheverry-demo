import React, { useState } from "react";
export default function Login({ onLogin, onPreview }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await onLogin(data.get("email"), data.get("password"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="workspace" style={{ maxWidth: 560, margin: "auto" }}>
      <div className="eyebrow">Tu espacio de aprendizaje</div>
      <h2>Ingresá al aula.</h2>
      <form onSubmit={submit}>
        <label className="field">
          Correo electrónico
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label className="field">
          Contraseña de demostración
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <button className="btn full" disabled={busy}>
          {busy ? "Ingresando…" : "Ingresar ↗"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
      <p className="note">
        Para probar el acceso, inscribite y aprobá tu comprobante desde el
        panel. Después abrí el correo simulado y creá una clave de prueba. No
        uses una contraseña real.
      </p>
      <button className="outline full" onClick={onPreview}>
        Explorar el aula sin inscripción
      </button>
    </div>
  );
}
