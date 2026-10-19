import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { money } from "../catalog.js";
export default function Admin({ notify }) {
  const [filter, setFilter] = useState("pending"),
    [page, setPage] = useState(0),
    [data, setData] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reject, setReject] = useState(null);
  async function refresh() {
    try {
      setData(
        await api("orders", undefined, { status: filter, page: String(page) }),
      );
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    let canceled = false;
    setData(null);
    api("orders", undefined, { status: filter, page: String(page) })
      .then((d) => {
        if (!canceled) {
          setData(d);
          setError("");
        }
      })
      .catch((e) => {
        if (!canceled) setError(e.message);
      });
    return () => {
      canceled = true;
    };
  }, [filter, page]);
  async function act(action, order, reason) {
    setBusy(true);
    setError("");
    try {
      const result = await api(action, { id: order.id, reason });
      notify(result.message);
      setReject(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="workspace">
      <div className="eyebrow">Administración / Chéverry</div>
      <div className="sectionhead">
        <div>
          <h2>Pagos y accesos.</h2>
          <p>Revisá cada comprobante antes de habilitar el curso.</p>
        </div>
        <button className="outline" disabled={busy} onClick={refresh}>
          Actualizar ↻
        </button>
      </div>
      <div className="stats">
        {[
          ["pending", "Por revisar"],
          ["approved", "Accesos habilitados"],
          ["rejected", "Rechazados"],
        ].map(([s, t]) => (
          <div className="stat" key={s}>
            <strong>{data?.counts[s] ?? "—"}</strong>
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="toolbar">
        {[
          ["pending", "Pendientes"],
          ["approved", "Aprobados"],
          ["rejected", "Rechazados"],
          ["all", "Todos"],
        ].map(([v, t]) => (
          <button
            className={`outline ${filter === v ? "active" : ""}`}
            disabled={busy}
            key={v}
            onClick={() => {
              setFilter(v);
              setPage(0);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p role="status">Cargando inscripciones…</p>}
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Curso / importe</th>
              <th>Comprobante</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.orders.map((o) => (
              <tr key={o.id}>
                <td data-label="Alumno">
                  <b>{o.name}</b>
                  <small>{o.email}</small>
                  {o.phone && <small>{o.phone}</small>}
                </td>
                <td data-label="Curso">
                  <span>
                    {o.courseTitle}
                    <small>
                      {money(o.amount)} · {o.date}
                    </small>
                  </span>
                </td>
                <td data-label="Comprobante">
                  <a
                    className="outline"
                    href={`/api?${new URLSearchParams({ action: "receipt", id: o.id })}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver archivo ↗
                  </a>
                </td>
                <td data-label="Estado">
                  <div>
                    <span className={`status ${o.status}`}>
                      {
                        {
                          pending: "Pendiente",
                          approved: "Aprobado",
                          rejected: "Rechazado",
                        }[o.status]
                      }
                    </span>
                    {o.status === "approved" && (
                      <small>
                        {o.mailStatus === "sent"
                          ? "Email aceptado por el servicio"
                          : "Email pendiente de envío"}
                      </small>
                    )}
                  </div>
                </td>
                <td data-label="Acciones">
                  {o.status === "pending" ? (
                    <>
                      <button
                        className="btn dark"
                        disabled={busy}
                        onClick={() => act("approve", o)}
                      >
                        Aprobar y enviar acceso
                      </button>
                      <button
                        className="outline"
                        disabled={busy}
                        onClick={() => setReject(o)}
                      >
                        Rechazar
                      </button>
                    </>
                  ) : o.status === "approved" && o.mailStatus !== "sent" ? (
                    <button
                      className="outline"
                      disabled={busy}
                      onClick={() => act("retry-mail", o)}
                    >
                      Reintentar email ↗
                    </button>
                  ) : o.status === "rejected" ? (
                    <small>{o.reason}</small>
                  ) : (
                    <small>Acceso habilitado</small>
                  )}
                </td>
              </tr>
            ))}
            {data?.orders.length === 0 && (
              <tr>
                <td colSpan={5}>No hay comprobantes en este estado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data && (
        <div className="toolbar">
          <button
            className="outline"
            disabled={busy || page === 0}
            onClick={() => setPage(page - 1)}
          >
            ← Anterior
          </button>
          <span>
            Página {page + 1} · {data.total} inscripciones
          </span>
          <button
            className="outline"
            disabled={busy || (page + 1) * 25 >= data.total}
            onClick={() => setPage(page + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
      {reject && (
        <div className="rejectpanel">
          <form
            className="purchasecard"
            onSubmit={(e) => {
              e.preventDefault();
              act(
                "reject",
                reject,
                new FormData(e.currentTarget).get("reason"),
              );
            }}
          >
            <h3>Rechazar comprobante</h3>
            <p>
              {reject.name} · {reject.courseTitle}
            </p>
            <label className="field">
              Motivo
              <input name="reason" required minLength={3} maxLength={500} />
            </label>
            <p>
              El alumno no tendrá acceso al curso. El motivo quedará registrado
              en el panel.
            </p>
            <div className="flex">
              <button className="btn" disabled={busy}>
                Confirmar rechazo
              </button>
              <button
                className="outline"
                disabled={busy}
                type="button"
                onClick={() => setReject(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
