import DomainReport from "./DomainReport.jsx";
import React, { useState, useRef, useEffect } from "react";
import { api, materialUrl } from "../api.js";
const checks = [
  "Identifiqué los datos del vehículo y del titular.",
  "Repasé los puntos de revisión del informe de dominio.",
  "Comprendí qué condiciones conversar antes de reservar.",
  "Revisé los campos del recibo de seña.",
  "Identifiqué qué dudas consultar con un profesional.",
];
export default function Classroom({ courseId, name, notify }) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  const saving = useRef(Promise.resolve());
  useEffect(() => {
    let canceled = false;
    api("classroom", undefined, { courseId })
      .then((d) => {
        if (!canceled) {
          if(d.demo) { try { const saved = JSON.parse(sessionStorage.getItem(`cheverry-progress:${courseId}`)); if(saved && Array.isArray(saved.done)) d.progress={done:saved.done.filter(n=>Number.isInteger(n)&&n>=0&&n<d.lessons.length),checks:[]}; } catch {} }
          setData(d);
        }
      })
      .catch((e) => {
        if (!canceled) setError(e.message);
      });
    return () => {
      canceled = true;
    };
  }, [courseId]);
  const lessons = data?.lessons || [],
    progress = data?.progress || { done: [], checks: [] };
  function onProgress(value) {
    setData((d) => ({ ...d, progress: value }));
    if(data?.demo) { try {sessionStorage.setItem(`cheverry-progress:${courseId}`,JSON.stringify(value));} catch {} }
    saving.current = saving.current
      .catch(() => {})
      .then(() => api("progress", { courseId, progress: value }))
      .catch((e) => notify("No pudimos guardar tu progreso. " + e.message));
  }
  const [selected, setSelected] = useState(0),
    reader = useRef(null);
  const l = lessons[selected],
    done = progress.done || [],
    checked = progress.checks || [];
  function choose(index) {
    setSelected(index);
    requestAnimationFrame(() =>
      reader.current?.scrollIntoView({ block: "start" }),
    );
  }
  function complete() {
    if (!done.includes(selected)) {
      onProgress({ ...progress, done: [...done, selected] });
      notify(
        done.length === lessons.length - 1
          ? "¡Completaste el curso!"
          : "Unidad completada.",
      );
    }
  }
  if (error)
    return (
      <section>
        <h2>No pudimos abrir este curso.</h2>
        <p role="alert">{error}</p>
        <a className="btn" href="#mis-cursos">
          Volver a mis cursos ↗
        </a>
      </section>
    );
  if (!data) return <section role="status">Cargando tu curso…</section>;
  if (!lessons.length)
    return (
      <section>
        <h2>{data.course.title}</h2>
        <p>El contenido todavía no está disponible.</p>
        <a href="#mis-cursos">Volver a mis cursos ↗</a>
      </section>
    );
  return (
    <div className="workspace">
      <div className="eyebrow">{`Mi aula / ${name}`}</div>
      <div className="sectionhead">
        <h2>{data.course.title}</h2>
        <span className="pill">
          {Math.round((done.length / lessons.length) * 100)}% COMPLETADO
        </span>
      </div>
      <div className="classgrid">
        <aside className="sidebar">
          <small>CURSO 01</small>
          <h3>El contenido, paso a paso.</h3>
          <div className="progress">
            <i style={{ width: `${(done.length / lessons.length) * 100}%` }} />
          </div>
          {lessons.map((lesson, i) => (
            <button
              key={lesson.title}
              className={`lessonbtn ${selected === i ? "active" : ""}`}
              onClick={() => choose(i)}
            >
              <span>{done.includes(i) ? "✓" : `0${i + 1}`}</span>
              {lesson.title}
            </button>
          ))}
          <p className="note">{data.demo ? "Tu avance se conserva en esta pestaña durante la demo." : "Tu progreso se guarda en tu cuenta."}</p>
        </aside>
        <article className="reader" ref={reader}>
          <div className="eyebrow">
            Unidad 0{selected + 1} /{" "}
            Contenido del curso
          </div>
          <h2>{l.title}</h2>
          <p>{l.desc}</p>
          {l.title === "Informe histórico de dominio" && <DomainReport />}
          {l.blocks ? <div className="lesson-content">{l.blocks.map((block,i)=><section className={`lesson-block ${block.tone || ""}`} key={i}>
            {block.heading && <h3>{block.heading}</h3>}
            {block.text && <p>{block.text}</p>}
            {block.items && <ul>{block.items.map(t=><li key={t}>{t}</li>)}</ul>}
            {block.definitions && <dl>{block.definitions.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>}
            {block.kind === "receipt" && <div className="receipt-model"><strong>CHEVERRY</strong><small>AUTOMOTORES · COMPRA · VENTA · CONSIGNACIONES</small><h4>RECIBO DE SEÑA</h4>{[
              ["Datos de la operación",["Fecha y hora","Lugar","Monto de la seña","Precio total acordado"]],
              ["Datos del vehículo",["Marca y modelo","Año","Dominio / Patente"]],
              ["Datos del vendedor",["Nombre y apellido","DNI"]],
              ["Datos del comprador",["Nombre y apellido","DNI"]]
            ].map(([title,fields])=><div key={title}><h5>{title}</h5>{fields.map(field=><div className="receipt-field" key={field}><span>{field}</span><i /></div>)}</div>)}<div className="receipt-signatures"><span>Firma del vendedor<br/>Aclaración y DNI</span><span>Firma del comprador<br/>Aclaración y DNI</span></div></div>}
          </section>)}</div> : (l.materialId ? (
            <>
              <div className="flex">
                <a
                  className="outline"
                  href={materialUrl(courseId, l.materialId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ampliar material ↗
                </a>
                <a
                  className="outline"
                  href={materialUrl(courseId, l.materialId, true)}
                  download={`Cheverry-guia-${selected + 1}.webp`}
                >
                  Descargar guía ↓
                </a>
              </div>
              <img
                src={materialUrl(courseId, l.materialId)}
                alt={`Material proporcionado por Cheverry: ${l.title}`}
              />
              <p className="note">
                Material de muestra proporcionado por el cliente. La versión
                final del curso y sus modelos documentales están pendientes de
                revisión profesional y actualización.
              </p>
            </>
          ) : (
            <div className="checks">
              {checks.map((t, i) => (
                <label key={t}>
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={(e) =>
                      onProgress({
                        ...progress,
                        checks: e.target.checked
                          ? [...checked, i]
                          : checked.filter((v) => v !== i),
                      })
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          ))}
          <div className="flex" style={{ marginTop: 25 }}>
            <button className="btn" onClick={complete}>
              {done.includes(selected)
                ? "✓ Unidad completada"
                : "Marcar como completada"}
            </button>
            {selected < lessons.length - 1 && (
              <button className="outline" onClick={() => choose(selected + 1)}>
                Siguiente unidad →
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
