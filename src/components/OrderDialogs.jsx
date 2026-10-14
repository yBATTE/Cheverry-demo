import React, { useState } from "react";
export function Receipt({ order: o }) {
  return (
    <>
      <div className="eyebrow">Comprobante de inscripción</div>
      <h2>Revisar archivo</h2>
      {o.file ? (
        o.file.startsWith("data:application/pdf") ? (
          <>
            <p>{o.fileName}</p>
            <a className="btn" href={o.file} download="comprobante-demo.pdf">
              Descargar PDF ↓
            </a>
          </>
        ) : (
          <img className="receipt" src={o.file} alt="Comprobante de prueba" />
        )
      ) : (
        <div className="mail">
          <b>COMPROBANTE FICTICIO</b>
          <p>Curso: Papelería automotor</p>
          <p>Alumno: {o.name}</p>
          <p>Importe: pendiente de definir</p>
          <small>Sin valor comercial. Solo para demostrar la revisión.</small>
        </div>
      )}
    </>
  );
}
export function Reject({ onSubmit }) {
  const [reason, setReason] = useState("");
  return (
    <>
      <h2>Rechazar comprobante</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (reason.trim()) onSubmit(reason.trim());
        }}
      >
        <label className="field">
          Motivo para el alumno
          <input
            required
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej.: El comprobante no es legible"
          />
        </label>
        <button className="btn">Confirmar rechazo</button>
      </form>
    </>
  );
}
export function Mail({ order: o, onActivate }) {
  return (
    <>
      <div className="eyebrow">Vista previa / Correo simulado</div>
      <h2>
        Tu próximo paso
        <br />
        ya está listo.
      </h2>
      <div className="mail">
        <small>PARA: {o.email}</small>
        <hr />
        <b>Bienvenido/a a Cheverry, {o.name}.</b>
        <p>
          Aprobamos tu inscripción a <b>Papelería automotor</b>. Activá tu
          acceso para encontrar todas las guías y continuar a tu ritmo.
        </p>
        <button className="btn" onClick={onActivate}>
          {o.activated ? "Ir a mi aula" : "Crear mi acceso"} ↗
        </button>
      </div>
      <p className="note">
        Este correo no se envía. En la versión real, el alumno recibirá un
        enlace privado para crear su contraseña.
      </p>
    </>
  );
}
export function Activate({ order, onSubmit }) {
  const [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">Activación de prueba</div>
      <h2>Creá tu acceso.</h2>
      <p>{order.email}</p>
      <form onSubmit={submit}>
        <label className="field">
          Contraseña de prueba (mínimo 8 caracteres)
          <input
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <p className="note">
          Usá una clave ficticia. Esta demo no implementa autenticación segura
          de producción.
        </p>
        {error && <p role="alert">{error}</p>}
        <button className="btn full" disabled={busy}>
          {busy ? "Activando…" : "Activar y entrar al aula ↗"}
        </button>
      </form>
    </>
  );
}
export function OrderStatus({ order: o, onBuy, onMail, navigate }) {
  if (!o)
    return (
      <div className="empty">
        <h2>Todavía no tenés una inscripción</h2>
        <button className="btn" onClick={onBuy}>
          Probar inscripción ↗
        </button>
      </div>
    );
  return (
    <section>
      <div className="eyebrow">Tu inscripción</div>
      <h2>
        {o.status === "approved"
          ? "Tu aula está lista."
          : o.status === "rejected"
            ? "Revisemos tu comprobante."
            : "Recibimos tu inscripción."}
      </h2>
      <p>Hola, {o.name}. Curso: Papelería automotor.</p>
      <p className="note">
        {o.status === "approved"
          ? "Pago aprobado en la demo. Ya podés activar tu acceso."
          : o.status === "rejected"
            ? `El comprobante fue rechazado. Motivo: ${o.reason}`
            : "Tu comprobante está pendiente de revisión. Podés ir al panel administrador para probar su aprobación."}
      </p>
      <div className="flex">
        {o.status === "approved" ? (
          <button className="btn" onClick={() => onMail(o)}>
            Ver correo de acceso ↗
          </button>
        ) : o.status === "rejected" ? (
          <button className="btn" onClick={onBuy}>
            Enviar un nuevo comprobante
          </button>
        ) : null}
        <button className="outline" onClick={() => navigate("admin")}>
          Ir al panel demo
        </button>
      </div>
    </section>
  );
}
