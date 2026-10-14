import React, { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./components/Home.jsx";
import Modal from "./components/Modal.jsx";
import Checkout from "./components/Checkout.jsx";
import Admin from "./components/Admin.jsx";
import Classroom from "./components/Classroom.jsx";
import Login from "./components/Login.jsx";
import {
  Receipt,
  Reject,
  Mail,
  Activate,
  OrderStatus,
} from "./components/OrderDialogs.jsx";
import { loadState, persistState, hashPassword } from "./storage.js";

export default function App() {
  const [state, setState] = useState(loadState),
    [route, setRoute] = useState(() => location.hash.slice(1) || "home"),
    [modal, setModal] = useState(null),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState(false),
    [session, setSession] = useState(null);
  const current = state.orders.find((o) => o.id === state.current),
    sessionOrder = state.orders.find((o) => o.id === session),
    modalOrder = state.orders.find((o) => o.id === modal?.id);
  useEffect(() => {
    const handler = () => setRoute(location.hash.slice(1) || "home");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (["courses", "program", "faq"].includes(route)) {
      const id = requestAnimationFrame(() =>
        document.getElementById(route)?.scrollIntoView(),
      );
      return () => cancelAnimationFrame(id);
    }
    window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4200);
    return () => clearTimeout(timer);
  }, [message]);
  function navigate(to) {
    setRoute(to);
    location.hash = to;
  }
  function commit(next) {
    try {
      persistState(next);
      setState(next);
      return true;
    } catch {
      setMessage(
        "No se pudo guardar. El almacenamiento está lleno o bloqueado; probá con un archivo más pequeño.",
      );
      return false;
    }
  }
  function updateOrder(id, patch) {
    return commit({
      ...state,
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    });
  }
  function open(type, o) {
    setModal({ type, id: o?.id });
  }
  function previewClass() {
    setPreview(true);
    navigate("class");
  }
  function buy() {
    open("checkout");
  }
  function approve(o) {
    if (o.status === "pending" && updateOrder(o.id, { status: "approved" }))
      setMessage("Inscripción aprobada. Correo de acceso simulado disponible.");
  }
  function enter(o) {
    setSession(o.id);
    setPreview(false);
    setModal(null);
    navigate("class");
  }
  async function login(email, password) {
    const hash = await hashPassword(password);
    const found = state.orders.find(
      (o) =>
        o.email === email.trim().toLowerCase() &&
        o.status === "approved" &&
        o.activated &&
        o.password === hash,
    );
    if (!found)
      throw new Error(
        "Acceso no disponible. Verificá tus datos y la aprobación de tu inscripción.",
      );
    enter(found);
  }
  const progressKey = preview ? "preview" : sessionOrder?.id;
  let page;
  if (route === "admin")
    page = (
      <Admin
        orders={state.orders}
        onReceipt={(o) => open("receipt", o)}
        onApprove={approve}
        onReject={(o) => open("reject", o)}
        onMail={(o) => open("mail", o)}
      />
    );
  else if (route === "status")
    page = (
      <OrderStatus
        order={current}
        onBuy={buy}
        onMail={(o) => open("mail", o)}
        navigate={navigate}
      />
    );
  else if (
    route === "class" &&
    (preview || sessionOrder?.status === "approved")
  )
    page = (
      <Classroom
        key={progressKey}
        preview={preview}
        name={sessionOrder?.name}
        progress={state.progress[progressKey] || { done: [], checks: [] }}
        onProgress={(value) =>
          commit({
            ...state,
            progress: { ...state.progress, [progressKey]: value },
          })
        }
        notify={setMessage}
      />
    );
  else if (route === "login" || route === "class")
    page = <Login onLogin={login} onPreview={previewClass} />;
  else page = <Home onBuy={buy} onPreview={previewClass} />;
  return (
    <>
      <Layout navigate={navigate} preview={previewClass}>
        {page}
      </Layout>
      {modal && (
        <Modal key={modal.type} onClose={() => setModal(null)}>
          {modal.type === "checkout" && (
            <Checkout
              onSubmit={(order) => {
                if (
                  !commit({
                    ...state,
                    orders: [...state.orders, order],
                    current: order.id,
                  })
                )
                  throw new Error(
                    "No se pudo guardar la inscripción. Probá con un archivo más pequeño.",
                  );
                setPreview(false);
                setModal(null);
                navigate("status");
              }}
            />
          )}
          {modalOrder && modal.type === "receipt" && (
            <Receipt order={modalOrder} />
          )}
          {modalOrder && modal.type === "reject" && (
            <Reject
              onSubmit={(reason) => {
                if (
                  updateOrder(modalOrder.id, { status: "rejected", reason })
                ) {
                  setModal(null);
                  setMessage("Comprobante rechazado con motivo.");
                }
              }}
            />
          )}
          {modalOrder && modal.type === "mail" && (
            <Mail
              order={modalOrder}
              onActivate={() => {
                if (modalOrder.activated) enter(modalOrder);
                else open("activate", modalOrder);
              }}
            />
          )}
          {modalOrder && modal.type === "activate" && (
            <Activate
              order={modalOrder}
              onSubmit={async (password) => {
                const hash = await hashPassword(password);
                if (
                  !updateOrder(modalOrder.id, {
                    password: hash,
                    activated: true,
                  })
                )
                  throw new Error("No se pudo guardar el acceso.");
                enter(modalOrder);
              }}
            />
          )}
        </Modal>
      )}
      {message && (
        <div id="toast" role="status" style={{ display: "block" }}>
          {message}
        </div>
      )}
    </>
  );
}
