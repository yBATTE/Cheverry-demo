import { demoEnabled, demoHandler } from "../server/demo.js";
import { Binary } from "mongodb";
import { database, rateLimit } from "../server/db.js";
import {
  assert,
  text,
  email,
  token,
  digest,
  hashPassword,
  verifyPassword,
  receipt,
  mayAccess,
  enforceOrigin,
} from "../server/security.js";
import { accessMail, sendMail } from "../server/mail.js";
const cookieName = () => (process.env.VERCEL ? "__Host-cheverry" : "cheverry");
const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};
async function readBody(req) {
  if (req.body !== undefined) {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    assert(
      Buffer.byteLength(JSON.stringify(body)) <= 3 * 1024 * 1024,
      413,
      "El archivo es demasiado grande.",
    );
    return body;
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    assert(size <= 3 * 1024 * 1024, 413, "El archivo es demasiado grande.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    assert(false, 400, "Solicitud inválida.");
  }
}
function cookie(res, value, age) {
  res.setHeader(
    "Set-Cookie",
    `${cookieName()}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${process.env.VERCEL || process.env.APP_URL?.startsWith("https:") ? "; Secure" : ""}`,
  );
}
async function userSession(db, req) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").map((v) => v.trim().split("=")),
  );
  const raw = cookies[cookieName()];
  if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return null;
  const session = await db
    .collection("sessions")
    .findOne({ _id: digest(raw), expiresAt: { $gt: new Date() } });
  return session
    ? db.collection("users").findOne({ _id: session.userId })
    : null;
}
const publicUser = (user) =>
  user
    ? { id: user._id, name: user.name, email: user.email, role: user.role }
    : null;
const publicCourse = (c) => ({
  id: c._id,
  title: c.title,
  summary: c.summary,
  audience: c.audience,
  syllabus: c.syllabus,
  price: c.price,
  available: c.available,
});
const publicOrder = (o) => ({
  id: o._id,
  name: o.name,
  email: o.email,
  phone: o.phone,
  courseId: o.courseId,
  courseTitle: o.courseTitle,
  amount: o.amount,
  status: o.status,
  date: new Date(o.createdAt).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  }),
  reason: o.reason,
  mailStatus: o.mailStatus,
  mailError: o.mailError,
});
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  try {
    const url = new URL(req.url, "http://localhost");
    const action = url.searchParams.get("action") || "catalog";
    assert(["GET", "POST"].includes(req.method), 405, "Método no permitido.");
    const mutations = new Set([
      "login",
      "logout",
      "order",
      "approve",
      "reject",
      "retry-mail",
      "activate",
      "recover",
      "progress",
    ]);
    assert(
      mutations.has(action) ? req.method === "POST" : req.method === "GET",
      405,
      "Método no permitido.",
    );
    if (req.method === "POST") enforceOrigin(req);
    const body = req.method === "POST" ? await readBody(req) : {};
    assert(
      body && typeof body === "object" && !Array.isArray(body),
      400,
      "Solicitud inválida.",
    );
    if (demoEnabled()) return await demoHandler(req, res, { action, body, url, json });
    const { db, client } = await database();
    const ip = process.env.VERCEL
      ? String(req.headers["x-forwarded-for"] || "").split(",")[0]
      : req.socket?.remoteAddress || "local";
    if (["order", "login", "recover", "activate"].includes(action))
      await rateLimit(
        db,
        `${action}:${digest(ip)}`,
        action === "order" ? 10 : 30,
      );
    if (action === "catalog") {
      const courses = await db
        .collection("courses")
        .find({})
        .sort({ position: 1 })
        .toArray();
      return json(res, 200, {
        courses: courses.map(publicCourse),
        payment: {
          alias: process.env.PAYMENT_ALIAS || "",
          holder: process.env.PAYMENT_HOLDER || "",
          bank: process.env.PAYMENT_BANK || "",
        },
      });
    }
    if (action === "order") {
      const course = await db
        .collection("courses")
        .findOne({ _id: text(body.courseId) });
      assert(
        course?.available &&
          Number.isFinite(course.price) &&
          course.price > 0 &&
          process.env.PAYMENT_ALIAS,
        400,
        "Este curso todavía no está habilitado para la venta.",
      );
      const name = text(body.name, 100),
        address = email(body.email);
      assert(name.length >= 2, 400, "Completá tu nombre y apellido.");
      await rateLimit(db, `order-email:${digest(address)}`, 5, 86400);
      const file = receipt(body.file);
      // The browser keeps one random key per submitted purchase; retries cannot create duplicates.
      assert(
        /^[a-f0-9-]{36}$/.test(body.requestId || ""),
        400,
        "Identificador de compra inválido.",
      );
      const id = body.requestId;
      await db
        .collection("orders")
        .updateOne(
          { _id: id },
          {
            $setOnInsert: {
              name,
              email: address,
              phone: text(body.phone, 40),
              courseId: course._id,
              courseTitle: course.title,
              amount: course.price,
              createdAt: new Date(),
              status: "pending",
              receipt: new Binary(file.bytes),
              receiptMime: file.mime,
            },
          },
          { upsert: true },
        );
      return json(res, 201, {
        id,
        message:
          "Recibimos tu comprobante. Cuando se apruebe el pago, te enviaremos el acceso por email.",
      });
    }
    if (action === "login") {
      const address = email(body.email);
      await rateLimit(db, `login-email:${digest(address)}`, 10);
      const user = await db.collection("users").findOne({ email: address });
      assert(
        await verifyPassword(body.password, user?.passwordHash),
        401,
        "Correo o contraseña incorrectos. Si aún no activaste tu cuenta, revisá tu email.",
      );
      const raw = token();
      await db
        .collection("sessions")
        .insertOne({
          _id: digest(raw),
          userId: user._id,
          expiresAt: new Date(Date.now() + 7 * 86400000),
        });
      cookie(res, raw, 7 * 86400);
      return json(res, 200, { user: publicUser(user) });
    }
    if (action === "recover") {
      const address = email(body.email);
      await rateLimit(db, `recover:${digest(address)}`, 3, 3600);
      const user = await db.collection("users").findOne({ email: address });
      if (user) {
        const secret = token();
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            {
              $set: {
                activationHash: digest(secret),
                activationExpires: new Date(Date.now() + 3600000),
              },
            },
          );
        try {
          await sendMail(
            address,
            "Recuperá tu acceso — Chéverry",
            `Creá una nueva contraseña desde este enlace (vence en una hora):\n${process.env.APP_URL}/#activar/${secret}`,
            `recover-${token()}`,
          );
        } catch {
          /* Same response for known and unknown addresses. */
        }
      }
      return json(res, 200, {
        message:
          "Si tenés una cuenta, te enviaremos un enlace para crear una nueva contraseña.",
      });
    }
    if (action === "activate") {
      assert(/^[a-f0-9]{64}$/.test(body.token || ""), 400, "Enlace inválido.");
      const passwordHash = await hashPassword(body.password);
      const user = await db
        .collection("users")
        .findOneAndUpdate(
          {
            activationHash: digest(body.token),
            activationExpires: { $gt: new Date() },
          },
          {
            $set: { passwordHash },
            $unset: { activationHash: "", activationExpires: "" },
          },
          { returnDocument: "after" },
        );
      assert(
        user,
        400,
        "El enlace venció o ya fue utilizado. Solicitá otro desde Recuperar acceso.",
      );
      await db.collection("sessions").deleteMany({ userId: user._id });
      cookie(res, "", 0);
      return json(res, 200, {
        message: "Contraseña guardada. Ya podés ingresar con tu email.",
      });
    }
    const user = await userSession(db, req);
    if (action === "me") return json(res, 200, { user: publicUser(user) });
    assert(user, 401, "Ingresá con tu usuario y contraseña.");
    if (action === "logout") {
      const raw = (req.headers.cookie || "")
        .split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith(`${cookieName()}=`))
        ?.split("=")[1];
      if (raw) await db.collection("sessions").deleteOne({ _id: digest(raw) });
      cookie(res, "", 0);
      return json(res, 200, { ok: true });
    }
    const courseId = text(body.courseId || url.searchParams.get("courseId"));
    if (["my-courses", "classroom", "material", "progress"].includes(action)) {
      if (action === "my-courses") {
        const enrolled = await db
          .collection("enrollments")
          .find({ userId: user._id })
          .toArray();
        const courses = await db
          .collection("courses")
          .find(
            user.role === "admin"
              ? {}
              : { _id: { $in: enrolled.map((e) => e.courseId) } },
          )
          .toArray();
        return json(res, 200, { courses: courses.map(publicCourse) });
      }
      const enrollment = await db
        .collection("enrollments")
        .findOne({ userId: user._id, courseId });
      assert(
        mayAccess(user, enrollment),
        403,
        "Tu cuenta no tiene acceso a este curso.",
      );
      const course = await db.collection("courses").findOne({ _id: courseId });
      assert(course, 404, "Curso no encontrado.");
      if (action === "classroom")
        return json(res, 200, {
          course: publicCourse(course),
          lessons: course.lessons || [],
          progress: enrollment?.progress || { done: [], checks: [] },
        });
      if (action === "progress") {
        assert(enrollment, 403, "No tenés una inscripción en este curso.");
        const done = Array.isArray(body.progress?.done)
          ? [...new Set(body.progress.done)].filter(
              (n) => Number.isInteger(n) && n >= 0 && n < course.lessons.length,
            )
          : [];
        const checks = Array.isArray(body.progress?.checks)
          ? [...new Set(body.progress.checks)].filter(
              (n) => Number.isInteger(n) && n >= 0 && n < 5,
            )
          : [];
        await db
          .collection("enrollments")
          .updateOne(
            { _id: enrollment._id },
            { $set: { progress: { done, checks } } },
          );
        return json(res, 200, { ok: true });
      }
      const materialId = text(url.searchParams.get("id"));
      assert(
        course.lessons.some((l) => l.materialId === materialId),
        404,
        "Material no encontrado.",
      );
      const material = await db
        .collection("materials")
        .findOne({ _id: materialId, courseId });
      assert(material, 404, "Material no encontrado.");
      res.setHeader("Content-Type", material.mime);
      res.setHeader(
        "Content-Disposition",
        `${url.searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="guia.webp"`,
      );
      return res.end(Buffer.from(material.bytes.buffer));
    }
    assert(
      user.role === "admin",
      403,
      "Acceso exclusivo para el administrador.",
    );
    if (action === "orders") {
      const page = Math.max(
        0,
        Math.min(100000, Number(url.searchParams.get("page")) || 0),
      );
      const filter = text(url.searchParams.get("status"));
      const query = ["pending", "approved", "rejected"].includes(filter)
        ? { status: filter }
        : {};
      const [orders, total, counts] = await Promise.all([
        db
          .collection("orders")
          .find(query, { projection: { receipt: 0 } })
          .sort({ createdAt: -1 })
          .skip(page * 25)
          .limit(25)
          .toArray(),
        db.collection("orders").countDocuments(query),
        db
          .collection("orders")
          .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
          .toArray(),
      ]);
      return json(res, 200, {
        orders: orders.map(publicOrder),
        total,
        counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
      });
    }
    const id = text(body.id || url.searchParams.get("id"));
    const order = await db.collection("orders").findOne({ _id: id });
    assert(order, 404, "Inscripción no encontrada.");
    if (action === "receipt") {
      res.setHeader("Content-Type", order.receiptMime);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="comprobante.${order.receiptMime === "application/pdf" ? "pdf" : order.receiptMime === "image/png" ? "png" : "jpg"}"`,
      );
      return res.end(Buffer.from(order.receipt.buffer));
    }
    if (action === "reject") {
      const reason = text(body.reason, 500);
      assert(reason.length >= 3, 400, "Indicá el motivo del rechazo.");
      const result = await db
        .collection("orders")
        .updateOne(
          { _id: id, status: "pending" },
          {
            $set: {
              status: "rejected",
              reason,
              reviewedBy: user._id,
              reviewedAt: new Date(),
            },
          },
        );
      assert(result.modifiedCount, 409, "Este comprobante ya fue procesado.");
      return json(res, 200, {
        message: "Comprobante rechazado. No se habilitó el curso.",
      });
    }
    if (action === "approve") {
      const session = client.startSession();
      try {
        await session.withTransaction(
          async () => {
            const current = await db
              .collection("orders")
              .findOne({ _id: id }, { session });
            if (current.status === "approved") return;
            assert(
              current.status === "pending",
              409,
              "Este comprobante ya fue rechazado.",
            );
            let buyer = await db
              .collection("users")
              .findOne({ email: current.email }, { session });
            if (!buyer) {
              buyer = {
                _id: token(),
                email: current.email,
                name: current.name,
                role: "student",
                passwordHash: null,
                createdAt: new Date(),
              };
              await db.collection("users").insertOne(buyer, { session });
            }
            await db
              .collection("enrollments")
              .updateOne(
                { userId: buyer._id, courseId: current.courseId },
                {
                  $setOnInsert: {
                    _id: token(),
                    userId: buyer._id,
                    courseId: current.courseId,
                    createdAt: new Date(),
                    progress: { done: [], checks: [] },
                  },
                },
                { upsert: true, session },
              );
            await db
              .collection("orders")
              .updateOne(
                { _id: id },
                {
                  $set: {
                    status: "approved",
                    mailStatus: "pending",
                    reviewedBy: user._id,
                    reviewedAt: new Date(),
                  },
                },
                { session },
              );
          },
          { maxCommitTimeMS: 8000 },
        );
      } finally {
        await session.endSession();
      }
      await accessMail(db, id);
      const updated = await db.collection("orders").findOne({ _id: id });
      return json(res, 200, {
        message:
          updated.mailStatus === "sent"
            ? "Pago aprobado. El servicio de correo aceptó el email de acceso."
            : "Pago aprobado y acceso habilitado. El correo está pendiente: podés reintentarlo desde el panel.",
      });
    }
    if (action === "retry-mail") {
      await rateLimit(db, `mail:${id}`, 5, 3600);
      assert(
        order.status === "approved" && order.mailStatus !== "sent",
        409,
        "Este correo ya fue aceptado por el proveedor.",
      );
      await accessMail(db, id);
      const updated = await db.collection("orders").findOne({ _id: id });
      return json(res, 200, {
        message:
          updated.mailStatus === "sent"
            ? "El servicio de correo aceptó el envío."
            : "No se confirmó el envío. Revisá la configuración e intentá nuevamente.",
      });
    }
    assert(false, 404, "Ruta no encontrada.");
  } catch (e) {
    if (!e.status) console.error("API failure:", e.name, e.code || "unknown");
    return json(res, e.status || 500, {
      error: e.status
        ? e.message
        : "No se pudo completar la operación. Intentá nuevamente.",
    });
  }
}
