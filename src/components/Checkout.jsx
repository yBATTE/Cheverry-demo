import React, { useRef, useState } from "react";
import { api } from "../api.js";
import { readReceipt } from "../storage.js";
import { money } from "../catalog.js";
import { whatsappFor } from "../config.js";
export default function Checkout({ course, payment, onSubmitted }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [preview, setPreview] = useState(null);
  const requestId = useRef(crypto.randomUUID());
  if (!course.available || !payment.alias || !payment.holder)
    return (
      <>
        <h2>Inscripción próximamente</h2>
        <p>Este curso todavía no está habilitado para la compra.</p>
        <a
          className="btn"
          href={whatsappFor(course.title)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar por WhatsApp ↗
        </a>
      </>
    );
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const file = await readReceipt(form.get("file"));
      if (!file) throw new Error("Adjuntá una foto o PDF del comprobante.");
      await api("order", {
        requestId: requestId.current,
        courseId: course.id,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        file,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="checkoutgrid">
      <div>
        <a className="textlink" href={`#curso/${course.id}`}>
          ← Volver al curso
        </a>
        <div className="eyebrow">Inscripción / Transferencia bancaria</div>
        <h2>Estás a un paso.</h2>
        <h3>{course.title}</h3>
        <div className="paymentdetails">
          <strong className="price">{money(course.price)}</strong>
          <p>Transferí el importe a esta cuenta y adjuntá el comprobante.</p>
          <dl>
            <dt>Alias</dt>
            <dd>{payment.alias}</dd>
            <dt>Titular</dt>
            <dd>{payment.holder}</dd>
            <dt>Banco</dt>
            <dd>{payment.bank || "—"}</dd>
          </dl>
        </div>
        <p>¿Tenés alguna duda antes de comprar?</p>
        <a
          className="outline"
          href={whatsappFor(course.title)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hablar con el vendedor ↗
        </a>
      </div>
      <form className="purchasecard" onSubmit={submit}>
        <div className="eyebrow">Tus datos de acceso</div>
        <label className="field">
          Nombre y apellido
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />
        </label>
        <label className="field">
          Email del alumno
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
          <small>
            A esta dirección te llegará el acceso. Revisá que esté bien escrita.
          </small>
        </label>
        <label className="field">
          WhatsApp (opcional)
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
        </label>
        <label className="field">
          Comprobante · JPG, PNG o PDF hasta 2 MB
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            required
            onChange={async (e) => {
              setPreview(null);
              setError("");
              const f = e.target.files[0];
              try {
                const data = await readReceipt(f);
                if (f?.type.startsWith("image/")) setPreview(data);
              } catch (err) {
                setError(err.message);
                e.target.value = "";
              }
            }}
          />
        </label>
        {preview && (
          <img
            className="receiptpreview"
            src={preview}
            alt="Comprobante seleccionado"
          />
        )}
        <p className="note">
          El acceso se habilita una vez que el vendedor revisa y aprueba el
          pago. Recibirás un email para crear tu contraseña.
        </p>
        {error && <p role="alert">{error}</p>}
        <button className="btn full" disabled={busy}>
          {busy ? "Enviando comprobante…" : "Enviar comprobante ↗"}
        </button>
      </form>
    </div>
  );
}
