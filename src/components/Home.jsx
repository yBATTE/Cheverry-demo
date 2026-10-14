import React from "react";
import { whatsappUrl } from "../config.js";
export default function Home({ onBuy, onPreview }) {
  return (
    <>
      <div className="hero">
        <div className="herocopy">
          <div className="eyebrow">Academia Chéverry / Curso 01</div>
          <h1>
            Comprá y vendé.
            <br />
            <em>
              Con los papeles
              <br />
              en orden.
            </em>
          </h1>
          <p>
            Aprendé a entender la documentación que acompaña la compra y venta
            de un vehículo. Menos dudas. Más criterio para avanzar.
          </p>
          <div className="heroactions">
            <button className="btn" onClick={onBuy}>
              Quiero conocer el curso <span>↗</span>
            </button>
            <a
              className="textlink"
              href={whatsappUrl}
              target="_blank"
              rel="noopener"
            >
              Consultar por WhatsApp ↗
            </a>
          </div>
          <div className="micro">
            <span>✓ A tu ritmo</span>
            <span>✓ Guías prácticas</span>
            <span>✓ Desde cualquier dispositivo</span>
          </div>
        </div>
        <div className="visual">
          <img
            src="assets/auto.jpg"
            alt="Vehículo deportivo en un entorno urbano"
          />
          <div className="visualtop">
            <span>CONOCIMIENTO QUE TE MUEVE</span>
            <span>01 / 03</span>
          </div>
          <div className="docstack">
            <small>CHÉVERRY / MATERIAL DE ESTUDIO</small>
            <b>
              PAPELERÍA
              <br />
              AUTOMOTOR
            </b>
            <hr />
            <p>01 — Informe de dominio</p>
            <p>02 — Seña y reserva</p>
            <p>03 — Recibo de seña</p>
            <hr />
            <div className="stamp">
              EL PRIMER PASO
              <br />
              ES SABER QUÉ REVISAR.
            </div>
          </div>
          <div className="visualcaption">
            <small>DEL CONOCIMIENTO A LA PRÁCTICA</small>
            <h3>Empezá por lo importante.</h3>
          </div>
        </div>
      </div>
      <div className="strip">
        <span>
          <b>↗</b> Formación enfocada en vehículos
        </span>
        <span>
          <b>▤</b> Material visual y ejemplos
        </span>
        <span>
          <b>◷</b> Aprendé a tu ritmo
        </span>
        <span>
          <b>↳</b> Todo en tu aula personal
        </span>
      </div>
      <section id="courses">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Tu camino en el rubro</div>
            <h2>
              Una academia.
              <br />
              Tus próximos pasos.
            </h2>
          </div>
          <p>
            Empezamos por la base de cada operación: los papeles. Una propuesta
            que va a seguir creciendo con vos.
          </p>
        </div>
        <div className="coursegrid">
          <article className="course">
            <div className="courseimage">
              <img src="assets/auto.jpg" alt="Automóvil" />
              <span className="pill">CURSO DISPONIBLE EN LA DEMO</span>
              <div className="big">
                Los papeles.
                <br />
                Sin vueltas.
              </div>
            </div>
            <div className="coursebody">
              <div className="eyebrow">01 / Documentación</div>
              <h3>Papelería automotor</h3>
              <p>
                Informe de dominio, reserva y recibo de seña. Una base práctica
                para entender cada documento.
              </p>
              <div className="coursefoot">
                <span>3 guías + checklist</span>
                <button className="btn" onClick={onBuy}>
                  Ver curso ↗
                </button>
              </div>
            </div>
          </article>
          <article className="course muted">
            <div className="courseimage">
              <span className="pill">PRÓXIMAMENTE</span>
              <span className="num">02</span>
            </div>
            <div className="coursebody">
              <div className="eyebrow">La formación continúa</div>
              <h3>Venta de vehículos</h3>
              <p>
                Un próximo paso dentro de la academia. Programa y fecha de
                lanzamiento a confirmar.
              </p>
              <div className="coursefoot">
                <span>Nombre propuesto para la demo</span>
                <span>↗</span>
              </div>
            </div>
          </article>
          <article className="course muted">
            <div className="courseimage">
              <span className="pill">PRÓXIMAMENTE</span>
              <span className="num">03</span>
            </div>
            <div className="coursebody">
              <div className="eyebrow">Pensá en grande</div>
              <h3>Tu propia concesionaria</h3>
              <p>
                Una nueva formación en preparación. Contenido y modalidad a
                confirmar.
              </p>
              <div className="coursefoot">
                <span>Nombre propuesto para la demo</span>
                <span>↗</span>
              </div>
            </div>
          </article>
        </div>
      </section>
      <section className="program" id="program">
        <div>
          <div className="eyebrow">Dentro del curso 01</div>
          <h2>
            Sabé qué mirar.
            <br />
            Entendé qué firmás.
          </h2>
          <p>
            Guías visuales que te ayudan a ordenar la documentación y a
            reconocer las preguntas que tenés que hacer.
          </p>
          <button className="btn" onClick={onPreview}>
            Explorar el aula demo ↗
          </button>
        </div>
        <div>
          <details open={true}>
            <summary>
              <span>01</span>
              <strong>Informe histórico de dominio</strong>
            </summary>
            <p>
              En esta primera guía vas a recorrer un informe de dominio,
              identificar los datos del vehículo y reconocer los puntos que
              requieren una revisión antes de continuar con la operación.
            </p>
          </details>
          <details>
            <summary>
              <span>02</span>
              <strong>Seña para reservar</strong>
            </summary>
            <p>
              Conocé el enfoque práctico de Chéverry para organizar una reserva:
              documentación a revisar, condiciones a conversar y datos que
              conviene dejar por escrito.
            </p>
          </details>
          <details>
            <summary>
              <span>03</span>
              <strong>Recibo de seña</strong>
            </summary>
            <p>
              Repasá los campos de un recibo de seña y cómo organizar la
              información del comprador, del vendedor y del vehículo. El modelo
              mostrado es parte del material de ejemplo.
            </p>
          </details>
          <details>
            <summary>
              <span>04</span>
              <strong>Checklist de la operación</strong>
            </summary>
            <p>
              Usá esta lista como guía de estudio y marcá los conceptos que ya
              revisaste.
            </p>
          </details>
        </div>
      </section>
      <section>
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Simple, de principio a fin</div>
            <h2>Tu acceso, en tres pasos.</h2>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <b>01</b>
            <h3>Elegí tu curso</h3>
            <p>
              Completá tus datos y seguí las indicaciones para realizar la
              transferencia.
            </p>
          </div>
          <div className="step">
            <b>02</b>
            <h3>Subí el comprobante</h3>
            <p>
              El equipo revisa el pago y confirma tu inscripción de forma
              manual.
            </p>
          </div>
          <div className="step">
            <b>03</b>
            <h3>Entrá a tu aula</h3>
            <p>
              Una vez aprobado, recibís por correo el enlace para activar tu
              acceso y consultar el material.
            </p>
          </div>
        </div>
      </section>
      <section className="faq" id="faq">
        <div>
          <div className="eyebrow">Antes de empezar</div>
          <h2>
            Que no te
            <br />
            queden dudas.
          </h2>
        </div>
        <div>
          <details>
            <summary>¿Necesito experiencia previa?</summary>
            <p>
              El curso de papelería es una introducción a la documentación de
              una operación. Podés recorrer las guías a tu ritmo.
            </p>
          </details>
          <details>
            <summary>¿Qué incluye este primer curso?</summary>
            <p>
              Las tres guías de ejemplo sobre informe de dominio, seña y recibo
              de seña, más una checklist interactiva.
            </p>
          </details>
          <details>
            <summary>¿Cuándo se habilita mi acceso?</summary>
            <p>
              Cuando el administrador verifica y aprueba tu comprobante. El
              plazo de revisión se definirá antes del lanzamiento.
            </p>
          </details>
          <details>
            <summary>¿Puedo comprar en esta demo?</summary>
            <p>
              No se reciben pagos reales. La inscripción, la aprobación y el
              correo se simulan en este navegador para mostrar el
              funcionamiento.
            </p>
          </details>
        </div>
      </section>
      <div className="cta">
        <h2>
          El próximo paso empieza
          <br />
          con lo que sabés.
        </h2>
        <button className="btn dark" onClick={onBuy}>
          Explorar papelería automotor ↗
        </button>
      </div>
    </>
  );
}
