import React, { useState, useRef } from "react";
import { lessons } from "../lessons.js";
const checks = [
  "Identifiqué los datos del vehículo y del titular.",
  "Repasé los puntos de revisión del informe de dominio.",
  "Comprendí qué condiciones conversar antes de reservar.",
  "Revisé los campos del recibo de seña.",
  "Identifiqué qué dudas consultar con un profesional.",
];
export default function Classroom({
  preview,
  name,
  progress,
  onProgress,
  notify,
}) {
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
        done.length === 3
          ? "¡Completaste el recorrido de demostración!"
          : "Unidad completada.",
      );
    }
  }
  return (
    <div className="workspace">
      <div className="eyebrow">
        {preview ? "Vista previa del aula" : `Mi aula / ${name}`}
      </div>
      <div className="sectionhead">
        <h2>Papelería automotor</h2>
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
          <p className="note">Tu progreso se conserva en este navegador.</p>
        </aside>
        <article className="reader" ref={reader}>
          <div className="eyebrow">
            Unidad 0{selected + 1} /{" "}
            {selected === 3 ? "Actividad práctica" : "Guía visual"}
          </div>
          <h2>{l.title}</h2>
          <p>{l.desc}</p>
          {selected < 3 ? (
            <>
              <div className="flex">
                <a
                  className="outline"
                  href={`assets/material-${l.image}.webp`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ampliar material ↗
                </a>
                <a
                  className="outline"
                  href={`assets/material-${l.image}.webp`}
                  download={`Cheverry-guia-${selected + 1}.webp`}
                >
                  Descargar guía ↓
                </a>
              </div>
              <img
                src={`assets/material-${l.image}.webp`}
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
          )}
          <div className="flex" style={{ marginTop: 25 }}>
            <button className="btn" onClick={complete}>
              {done.includes(selected)
                ? "✓ Unidad completada"
                : "Marcar como completada"}
            </button>
            {selected < 3 && (
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
