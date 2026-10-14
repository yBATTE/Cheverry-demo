import { config } from "./config.js";
export const initialState = () => ({
  orders: [
    {
      id: "DEMO-001",
      name: "Sofía Martínez",
      email: "sofia@ejemplo.com",
      date: "13/10/2026",
      status: "pending",
      file: null,
      sample: true,
    },
  ],
  current: null,
  progress: {},
});
export function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem(config.storageKey));
    if (
      Array.isArray(data?.orders) &&
      data.progress &&
      typeof data.progress === "object"
    )
      return data;
  } catch {}
  return initialState();
}
export function persistState(state) {
  localStorage.setItem(config.storageKey, JSON.stringify(state));
}
export async function hashPassword(value) {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      "Para crear el acceso, usá localhost o una conexión HTTPS.",
    );
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(hash))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export async function readReceipt(file) {
  if (!file || !file.size) return null;
  if (
    !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  )
    throw new Error("Usá un JPG, PNG o PDF de hasta 2 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el comprobante."));
    reader.readAsDataURL(file);
  });
}
