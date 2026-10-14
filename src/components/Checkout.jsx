import React, { useState } from "react";
import { readReceipt } from "../storage.js";
export default function Checkout({ onSubmit }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const name = form.get("name").trim(),
        email = form.get("email").trim().toLowerCase();
      if (!name) throw new Error("Completá tu nombre.");
      const file = form.get("file"),
        data = await readReceipt(file);
      await onSubmit({
        id:
          "DEMO-" + `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name,
        email,
        status: "pending",
        date: new Date().toLocaleDateString("es-AR"),
        file: data,
        fileName: file?.size ? file.name : null,
        sample: !data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">Curso 01 / Inscripción de prueba</div>
      <h2>Papelería automotor</h2>
      <p className="note">
        Precio y datos de transferencia pendientes de definir. No transfieras
        dinero: este recorrido es una demostración.
      </p>
      <form onSubmit={submit}>
        <label className="field">
          Nombre y apellido
          <input
            name="name"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Tu nombre completo"
          />
        </label>
        <label className="field">
          Correo electrónico
          <input
            name="email"
            type="email"
            required
            maxLength={140}
            autoComplete="email"
            placeholder="nombre@correo.com"
          />
        </label>
        <label className="field">
          Comprobante de prueba · JPG, PNG o PDF (máx. 2 MB)
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
          />
        </label>
        <p className="note">
          Podés dejar el archivo vacío para usar un comprobante ficticio. No
          subas datos bancarios reales.
        </p>
        {error && <p role="alert">{error}</p>}
        <button className="btn full" disabled={busy}>
          {busy ? "Procesando…" : "Enviar a revisión ↗"}
        </button>
      </form>
    </>
  );
}
