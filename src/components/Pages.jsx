import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { money } from "../catalog.js";
import { whatsappFor } from "../config.js";
export function CourseDetail({ course, navigate }) {
  return (
    <>
      <section className="detailhero">
        <div>
          <a className="textlink" href="#courses">
            ← Todos los cursos
          </a>
          <div className="eyebrow">
            Academia Chéverry / Formación automotriz
          </div>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          <p className="mutedtext">{course.audience}</p>
          <div className="micro">
            <span>✓ A tu ritmo</span>
            <span>✓ Desde el celular</span>
            <span>✓ Aula personal</span>
          </div>
        </div>
        <aside className="purchasecard">
          <div className="eyebrow">Tu próximo paso</div>
          <h3>{course.title}</h3>
          <strong className="price">
            {course.demoOpen ? "Acceso abierto" : course.available ? money(course.price) : "Próximamente"}
          </strong>
          <p>
            {course.demoOpen ? "Recorré el contenido del curso." : course.available
              ? "Pago por transferencia. El acceso se habilita después de revisar el comprobante."
              : "Estamos preparando esta formación. Consultanos por su lanzamiento."}
          </p>
          {course.demoOpen && <button className="btn full" onClick={() => navigate(`aula/${course.id}`)}>Entrar al curso ↗</button>}
          {course.available && (
            <button
              className="btn full"
              onClick={() => navigate(`comprar/${course.id}`)}
            >
              Comprar este curso ↗
            </button>
          )}
          <a
            className="outline full"
            href={whatsappFor(course.title)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp ↗
          </a>
          <button
            className="textlink"
            onClick={() => navigate(`aula/${course.id}`)}
          >
            Ya lo compré · Ingresar al aula ↗
          </button>
        </aside>
      </section>
      <section className="program">
        <div>
          <div className="eyebrow">El contenido</div>
          <h2>
            Lo que vas
            <br />a aprender.
          </h2>
          <p>
            Una formación para avanzar paso a paso y volver al material cuando
            lo necesites.
          </p>
        </div>
        <div>
          {course.syllabus?.length ? (
            course.syllabus.map((title, i) => (
              <div className="syllabusitem" key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
              </div>
            ))
          ) : (
            <p>
              El programa y la fecha de lanzamiento se confirmarán próximamente.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
export function MyCourses({ name }) {
  const [courses, setCourses] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("my-courses")
      .then((data) => setCourses(data.courses))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section>
      <div className="eyebrow">Mi academia / {name}</div>
      <h2>
        Tus cursos.
        <br />
        Tu próximo paso.
      </h2>
      {error && <p role="alert">{error}</p>}
      {!courses && !error && <p role="status">Cargando cursos…</p>}
      {courses?.length === 0 && (
        <p>
          Cuando se apruebe tu compra, el curso aparecerá acá.{" "}
          <a href="#courses">Ver cursos ↗</a>
        </p>
      )}
      <div className="mycoursegrid">
        {courses?.map((c) => (
          <article className="purchasecard" key={c.id}>
            <span className="pill">ACCESO HABILITADO</span>
            <h3>{c.title}</h3>
            <p>{c.summary}</p>
            <a className="btn" href={`#aula/${c.id}`}>
              Entrar al curso ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Activation({ token, navigate }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    if (data.get("password") !== data.get("confirm"))
      return setError("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      await api("activate", { token, password: data.get("password") });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="authpage">
      <div className="eyebrow">Tu cuenta Chéverry</div>
      <h2>{done ? "Ya podés ingresar." : "Creá tu contraseña."}</h2>
      {done ? (
        <>
          <p>Usá el email de tu compra y la contraseña que acabás de crear.</p>
          <button className="btn full" onClick={() => navigate("login")}>
            Ingresar a mi cuenta ↗
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <p>
            Elegí una contraseña de al menos 10 caracteres para ingresar a tus
            cursos.
          </p>
          <label className="field">
            Contraseña
            <input
              name="password"
              type="password"
              minLength={10}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            Repetí la contraseña
            <input
              name="confirm"
              type="password"
              minLength={10}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="btn full" disabled={busy}>
            {busy ? "Guardando…" : "Guardar contraseña ↗"}
          </button>
          <a className="textlink" href="#login">
            ¿Venció el enlace? Recuperar acceso ↗
          </a>
        </form>
      )}
    </section>
  );
}
