import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const token = () => randomBytes(32).toString("hex");
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function assert(condition, status, message) {
  if (!condition) throw new HttpError(status, message);
}
export function text(value, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
export function email(value) {
  const result = text(value, 254).toLowerCase();
  assert(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result),
    400,
    "Ingresá un correo válido.",
  );
  return result;
}
export async function hashPassword(password) {
  assert(
    typeof password === "string" &&
      password.length >= 10 &&
      password.length <= 128,
    400,
    "La contraseña debe tener entre 10 y 128 caracteres.",
  );
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || password.length > 128 || !stored)
    return false;
  const [salt, value] = stored.split(":");
  if (!salt || !/^[a-f0-9]{128}$/.test(value || "")) return false;
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(value, "hex"));
}
export function receipt(data) {
  assert(typeof data === "string", 400, "Adjuntá el comprobante.");
  const match =
    /^data:(image\/jpeg|image\/png|application\/pdf);base64,([A-Za-z0-9+/=]+)$/.exec(
      data,
    );
  assert(match, 400, "Usá un JPG, PNG o PDF.");
  const bytes = Buffer.from(match[2], "base64");
  assert(
    bytes.length > 0 && bytes.length <= 2 * 1024 * 1024,
    400,
    "El archivo debe pesar hasta 2 MB.",
  );
  const valid =
    match[1] === "application/pdf"
      ? bytes.subarray(0, 5).toString() === "%PDF-"
      : match[1] === "image/png"
        ? bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  assert(valid, 400, "El contenido del archivo no coincide con su formato.");
  return { bytes, mime: match[1] };
}
export function mayAccess(user, enrollment) {
  return Boolean(
    user && (user.role === "admin" || enrollment?.userId === user._id),
  );
}
export function enforceOrigin(req) {
  const expected = process.env.APP_URL;
  assert(expected, 503, "Falta configurar APP_URL en el servidor.");
  const origin = req.headers.origin;
  assert(origin === new URL(expected).origin, 403, "Origen no autorizado.");
  assert(
    (req.headers["content-type"] || "").startsWith("application/json"),
    415,
    "Se requiere JSON.",
  );
}
