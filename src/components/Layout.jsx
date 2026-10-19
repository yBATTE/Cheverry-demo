import React from "react";
import { config, whatsappUrl } from "../config.js";
function Brand() {
  return (
    <a className="brand" href="#home">
      <span className="brand-logo">
        <img
          src="/assets/cheverry-logo-original.webp"
          alt="Cheverry Automotores"
        />
      </span>
      <span className="brand-caption">
        ACADEMIA<span>COMPRA · VENTA · FORMACIÓN</span>
      </span>
    </a>
  );
}
export default function Layout({ children, navigate, user, onLogout }) {
  return (
    <>
      <div className="demo">
        ACADEMIA CHÉVERRY <span>Formación para tu próximo paso.</span>
        {user && <button onClick={onLogout}>Cerrar sesión</button>}
      </div>
      <header>
        <Brand />
        <nav>
          <a href="#courses">Cursos</a>
          <a href="#program">Qué vas a aprender</a>
          <a href="#faq">Preguntas frecuentes</a>
        </nav>
        <button className="outline" onClick={() => navigate("mis-cursos")}>
          Mi aula <span>↗</span>
        </button>
      </header>
      <main>{children}</main>
      <footer>
        <Brand />
        <div className="footercontact">
          <p>Conocimiento para tu próxima operación.</p>
          <a href={config.instagram} target="_blank" rel="noopener noreferrer">
            @cheverryautos ↗
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp · +54 9 11 6556-2728 ↗
          </a>
        </div>
        <a className="textlink" href="#admin">
          Administración ↗
        </a>
        <small>© 2026 Chéverry · Academia automotriz</small>
      </footer>
      <div className="mobilebar" aria-label="Accesos rápidos">
        <a href="#courses">
          <span>▤</span>Cursos
        </a>
        <button onClick={() => navigate("mis-cursos")}>
          <span>↗</span>Mi aula
        </button>
        <a
          className="whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>◉</span>WhatsApp
        </a>
      </div>
      <a
        className="desktopwhatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Consultar por WhatsApp ↗
      </a>
    </>
  );
}
