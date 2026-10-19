import React from "react";
import { money } from "../catalog.js";
import { config, whatsappUrl } from "../config.js";
export default function Home({ courses, onBuy }) {
  const first = courses.find((c) => c.id === "papeleria-automotor");
  return (
    <div className="clublanding">
      <section className="clubhero">
        <div className="clubbadge">
          <i />
          ACADEMIA CHÉVERRY · FORMACIÓN AUTOMOTRIZ
        </div>
        <h1>
          Aprendé a comprar
          <br />y vender autos.
          <br />
          <em>Con criterio.</em>
        </h1>
        <p className="clublead">
          Entendé los papeles. Desarrollá tu forma de vender.
          <br className="desktopbreak" /> Prepará el camino hacia tu propio
          negocio.
        </p>
        <a className="clubbutton" href="#courses">
          Encontrá tu próximo paso <span>↗</span>
        </a>
        <span className="clubsubnote">
          Cursos online · A tu ritmo · Desde donde estés
        </span>
        <div className="clubfilm">
          {config.presentationVideo ? (
            <video
              controls
              preload="none"
              playsInline
              poster="/assets/auto.jpg"
              src={config.presentationVideo}
              aria-label="Presentación de Academia Chéverry"
            />
          ) : (
            <>
              <img
                src="/assets/auto.jpg"
                alt="Vehículo deportivo, parte del universo automotor de Academia Chéverry"
                fetchPriority="high"
              />
              <div className="clubfilmshade" />
              <div className="clubfilmtop">
                <span>CHÉVERRY / ACADEMIA</span>
                <span>DEL CONOCIMIENTO A LA PRÁCTICA ↗</span>
              </div>
              <div className="clubfilmcopy">
                <small>EL PRIMER PASO ES SABER.</small>
                <h2>
                  El negocio empieza
                  <br />
                  <em>antes de la venta.</em>
                </h2>
              </div>
            </>
          )}
        </div>
        <a
          className="clubquiet"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          ¿No sabés por dónde empezar? Hablá con nosotros ↗
        </a>
      </section>
      <div className="clubdivider" />
      <section className="clubcontext" id="program">
        <div>
          <span className="clublabel">NO ES SOLO PUBLICAR UN AUTO.</span>
          <h2>
            Detrás de cada operación,
            <br />
            hay algo que
            <br />
            <em>tenés que saber.</em>
          </h2>
          <p>
            Comprar, reservar y vender implica tomar decisiones. Esta academia
            está pensada para ayudarte a entender qué mirar y cómo ordenar tus
            próximos pasos en el rubro.
          </p>
        </div>
        <div className="clubprinciples">
          <article>
            <span>01</span>
            <div>
              <h3>Entender antes de avanzar.</h3>
              <p>
                Reconocer los documentos y saber qué preguntas hacer antes de
                cerrar una operación.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Construir una base.</h3>
              <p>
                Empezar por los papeles y seguir formándote según el momento en
                el que estés.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Volver a lo que aprendiste.</h3>
              <p>
                Tener el material en tu aula personal para recorrerlo a tu ritmo
                y repasar cada guía.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="clubcourses" id="courses">
        <div className="clubsectionhead">
          <span className="clublabel">ELEGÍ DÓNDE QUERÉS EMPEZAR</span>
          <h2>
            Un rubro.
            <br />
            <em>Tus próximos pasos.</em>
          </h2>
          <p>
            Desde la documentación de una operación hasta el proyecto de tu
            propia concesionaria.
          </p>
        </div>
        <div className="clubcoursegrid">
          {courses.map((course, i) => (
            <article
              className={`clubcourse ${i === 0 ? "featured" : ""}`}
              key={course.id}
            >
              <a
                className="clubcoursevisual"
                href={`#curso/${course.id}`}
                aria-label={`Conocer ${course.title}`}
              >
                <img src="/assets/auto.jpg" loading="lazy" alt="" />
                <span className="clubcoursenum">0{i + 1}</span>
                <span
                  className={`clubstatus ${course.available ? "open" : ""}`}
                >
                  {course.demoOpen ? "ACCESO ABIERTO" : course.available ? "INSCRIPCIONES ABIERTAS" : "PRÓXIMAMENTE"}
                </span>
                <strong>
                  {
                    [
                      "Los papeles.\nSin vueltas.",
                      "La venta.\nCon dirección.",
                      "Tu negocio.\nEl próximo nivel.",
                    ][i]
                  }
                </strong>
              </a>
              <div className="clubcoursebody">
                <span className="clublabel">
                  {
                    [
                      "DOCUMENTACIÓN",
                      "DESARROLLO COMERCIAL",
                      "TU PROPIO NEGOCIO",
                    ][i]
                  }
                </span>
                <h3>{course.title}</h3>
                <p>{course.summary}</p>
                <div className="clubcoursebottom">
                  <span>
                    {course.demoOpen ? "Entrá a conocer el aula" : course.available
                      ? money(course.price)
                      : "Lanzamiento a confirmar"}
                  </span>
                  <a href={`#curso/${course.id}`}>Conocer el curso ↗</a>
                </div>
                {course.demoOpen && <a className="clubbutton" href={`#aula/${course.id}`}>Entrar al curso ↗</a>}
                {course.available && (
                  <a className="clubbutton" href={`#comprar/${course.id}`}>
                    Quiero este curso ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="clubfirstcourse">
        <div>
          <span className="clublabel">EMPEZÁ POR LA BASE / CURSO 01</span>
          <h2>
            Sabé qué mirar.
            <br />
            <em>Entendé qué firmás.</em>
          </h2>
          <p>
            Papelería automotor reúne las guías para empezar a entender la
            documentación que acompaña una compra o venta.
          </p>
          <button className="clubbutton" onClick={onBuy}>
            Conocer papelería automotor ↗
          </button>
        </div>
        <div className="clubsyllabus">
          {(first?.syllabus || []).map((title, i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <span>↗</span>
            </div>
          ))}
          <p>Cinco unidades para recorrer los papeles de una operación.</p>
        </div>
      </section>
      <section className="clubhow">
        <div className="clubsectionhead">
          <span className="clublabel">DE TU ELECCIÓN A TU AULA</span>
          <h2>
            Así de <em>simple.</em>
          </h2>
        </div>
        <div className="clubhowgrid">
          {[
            [
              "Elegí tu formación.",
              "Conocé el programa y elegí el curso con inscripción abierta que se ajuste a tu próximo paso.",
            ],
            [
              "Enviá el comprobante.",
              "Realizá la transferencia y adjuntá una foto o PDF con tus datos. El vendedor revisa el pago.",
            ],
            [
              "Entrá a tu curso.",
              "Una vez aprobado, te llega un email para crear tu contraseña. Tu material te espera en el aula.",
            ],
          ].map(([title, desc], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="clubfaq" id="faq">
        <div className="clubsectionhead">
          <span className="clublabel">ANTES DE DAR EL PASO</span>
          <h2>
            Que no te queden <em>dudas.</em>
          </h2>
        </div>
        <div>
          {[
            [
              "¿Necesito tener una concesionaria?",
              "No. El primer curso está orientado a quienes quieren empezar a entender la documentación de una compra o venta de vehículos.",
            ],
            [
              "¿Cómo compro un curso?",
              "Entrá a un curso con inscripción abierta, consultá los datos de transferencia y enviá tu comprobante con el email del alumno. El vendedor lo revisa antes de habilitar el acceso.",
            ],
            [
              "¿Cuándo me llega el acceso?",
              "Cuando se aprueba tu comprobante, se envía el email con tu usuario y el enlace para crear la contraseña. Revisá también spam. Si necesitás consultar el estado, escribinos por WhatsApp.",
            ],
            [
              "¿Lo puedo ver desde el celular?",
              "Sí. Podés ingresar desde el celular, la tablet o la computadora con tu email y contraseña. El progreso se guarda en tu cuenta.",
            ],
            [
              "¿Necesito una cuenta por cada curso?",
              "No. Comprá siempre con el mismo email y vas a encontrar todos tus cursos habilitados dentro de una sola cuenta.",
            ],
            [
              "¿Ya están disponibles las tres formaciones?",
              "Las inscripciones abiertas se indican en cada curso. Las próximas formaciones tendrán su programa y fecha de lanzamiento publicados cuando se confirmen.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="clubfinal">
        <span className="clublabel">EL PRÓXIMO PASO ES TUYO</span>
        <h2>
          Tu lugar en el rubro
          <br />
          <em>empieza con lo que sabés.</em>
        </h2>
        <p>
          Elegí tu formación o escribinos. Te ayudamos a encontrar por dónde
          empezar.
        </p>
        <a className="clubbutton" href="#courses">
          Quiero conocer los cursos ↗
        </a>
        <a
          className="clubquiet"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Prefiero hablar por WhatsApp ↗
        </a>
      </section>
    </div>
  );
}
