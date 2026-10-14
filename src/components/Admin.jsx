import React, { useState } from "react";
export default function Admin({
  orders,
  onReceipt,
  onApprove,
  onReject,
  onMail,
}) {
  const [filter, setFilter] = useState("all");
  const list = orders.filter((o) => filter === "all" || o.status === filter);
  return (
    <div className="workspace">
      <div className="eyebrow">Administración / Modo demostración</div>
      <h2>Inscripciones y pagos</h2>
      <p>Revisá comprobantes y gestioná el acceso al curso de papelería.</p>
      <div className="stats">
        {[
          ["pending", "Por revisar"],
          ["approved", "Accesos habilitados"],
          ["rejected", "Rechazados"],
        ].map(([s, t]) => (
          <div className="stat" key={s}>
            <strong>
              {String(orders.filter((o) => o.status === s).length).padStart(
                2,
                "0",
              )}
            </strong>
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="toolbar">
        {[
          ["all", "Todos"],
          ["pending", "Pendientes"],
          ["approved", "Aprobados"],
          ["rejected", "Rechazados"],
        ].map(([v, t]) => (
          <button
            key={v}
            className={`outline ${filter === v ? "active" : ""}`}
            onClick={() => setFilter(v)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Curso / fecha</th>
              <th>Comprobante</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((o) => (
                <tr key={o.id}>
                  <td data-label="Alumno">
                    <b>{o.name}</b>
                    <small>{o.email}</small>
                  </td>
                  <td data-label="Curso">
                    Papelería automotor<small>{o.date}</small>
                  </td>
                  <td data-label="Comprobante">
                    <button className="outline" onClick={() => onReceipt(o)}>
                      Ver archivo ↗
                    </button>
                  </td>
                  <td data-label="Estado">
                    <span className={`status ${o.status}`}>
                      {
                        {
                          pending: "Pendiente",
                          approved: "Aprobado",
                          rejected: "Rechazado",
                        }[o.status]
                      }
                    </span>
                  </td>
                  <td data-label="Acciones">
                    {o.status === "pending" ? (
                      <>
                        <button
                          className="btn dark"
                          onClick={() => onApprove(o)}
                        >
                          Aprobar
                        </button>
                        <button className="outline" onClick={() => onReject(o)}>
                          Rechazar
                        </button>
                      </>
                    ) : o.status === "approved" ? (
                      <button className="outline" onClick={() => onMail(o)}>
                        Ver correo demo ↗
                      </button>
                    ) : (
                      <small>{o.reason}</small>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No hay inscripciones en este estado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="note">
        Panel de demostración. Los datos se guardan únicamente en este
        navegador; no hay pagos, correos ni cuentas reales.
      </p>
    </div>
  );
}
