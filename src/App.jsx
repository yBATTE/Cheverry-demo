import React, { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./components/Home.jsx";
import Checkout from "./components/Checkout.jsx";
import Admin from "./components/Admin.jsx";
import Classroom from "./components/Classroom.jsx";
import Login from "./components/Login.jsx";
import { CourseDetail, MyCourses, Activation } from "./components/Pages.jsx";
import { api } from "./api.js";
import { defaultCourses } from "./catalog.js";
import { whatsappFor } from "./config.js";
export default function App() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || "home");
  const [catalog, setCatalog] = useState(defaultCourses),
    [payment, setPayment] = useState({});
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [demo, setDemo] = useState(false);
  function navigate(to) {
    location.hash = to;
  }
  useEffect(() => {
    const handler = () => setRoute(location.hash.slice(1) || "home");
    addEventListener("hashchange", handler);
    api("catalog")
      .then((data) => {
        if (data.courses.length) setCatalog(data.courses);
        setPayment(data.payment);
        setDemo(Boolean(data.demo));
      })
      .catch((e) => setCatalogError(e.message));
    api("me")
      .then((data) => setUser(data.user))
      .catch(() => {})
      .finally(() => setReady(true));
    return () => removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (["courses", "program", "faq"].includes(route))
      requestAnimationFrame(() =>
        document.getElementById(route)?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(t);
  }, [message]);
  async function login(email, password) {
    const data = await api("login", { email, password });
    setUser(data.user);
    navigate(
      data.user.role === "admin"
        ? "admin"
        : route.startsWith("aula/")
          ? route
          : "mis-cursos",
    );
  }
  async function logout() {
    try {
      await api("logout", {});
      setUser(null);
      navigate("home");
    } catch (e) {
      setMessage(e.message);
    }
  }
  const [kind, id] = route.split("/"),
    course = catalog.find((c) => c.id === id);
  let page;
  if (kind === "curso" || kind === "comprar")
    page = course ? (
      kind === "curso" ? (
        <CourseDetail course={course} navigate={navigate} />
      ) : (
        <section className="purchasepage">
          <Checkout
            key={course.id}
            course={course}
            payment={payment}
            onSubmitted={() => navigate("enviado")}
          />
        </section>
      )
    ) : (
      <section>
        <h2>Curso no encontrado</h2>
        <a href="#courses">Volver al catálogo ↗</a>
      </section>
    );
  else if (kind === "activar")
    page = <Activation token={id} navigate={navigate} />;
  else if (kind === "enviado")
    page = (
      <section className="confirmation">
        <div className="eyebrow">Comprobante recibido</div>
        <h2>
          Tu próximo paso
          <br />
          ya está en marcha.
        </h2>
        <p>
          Vamos a revisar el pago. Cuando se apruebe, te llegará un email para
          activar el acceso al curso. Revisá también la carpeta de spam.
        </p>
        <a
          className="btn"
          href={whatsappFor()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hablar con Chéverry ↗
        </a>
        <a className="outline" href="#courses">
          Ver los cursos
        </a>
      </section>
    );
  else if (["login", "admin", "mis-cursos", "aula"].includes(kind)) {
    if (!ready) page = <section role="status">Cargando tu cuenta…</section>;
    else if (kind === "aula" && demo && id === "papeleria-automotor") page = <Classroom key={id} courseId={id} name={user?.name || "Visitante"} notify={setMessage} />;
    else if (!user) page = <Login onLogin={login} admin={kind === "admin"} />;
    else if (kind === "admin")
      page =
        user.role === "admin" ? (
          <Admin notify={setMessage} />
        ) : (
          <section>
            <h2>Acceso restringido</h2>
            <p>Esta sección es exclusiva del administrador.</p>
            <a href="#mis-cursos">Ir a mis cursos ↗</a>
          </section>
        );
    else if (kind === "aula")
      page = (
        <Classroom
          key={id}
          courseId={id}
          name={user.name}
          notify={setMessage}
        />
      );
    else page = <MyCourses name={user.name} />;
  } else
    page = (
      <Home
        courses={catalog}
        onBuy={() => navigate("curso/papeleria-automotor")}
        onPreview={() => navigate("curso/papeleria-automotor")}
      />
    );
  return (
    <Layout navigate={navigate} user={user} onLogout={logout}>
      {catalogError && (
        <div className="serviceerror" role="alert">
          El catálogo no está disponible en este momento. Podés consultarnos por
          WhatsApp.
        </div>
      )}
      {page}
      {message && (
        <div id="toast" role="status" style={{ display: "block" }}>
          {message}
        </div>
      )}
    </Layout>
  );
}
