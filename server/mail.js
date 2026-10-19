import { token, digest, assert } from "./security.js";
export async function sendMail(to, subject, message, id) {
  assert(
    process.env.RESEND_API_KEY && process.env.EMAIL_FROM,
    503,
    "Falta configurar el servicio de correo.",
  );
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": id,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text: message,
    }),
    signal: AbortSignal.timeout(12000),
  });
  if (!result.ok)
    throw new Error(
      "El proveedor de correo no aceptó el envío. Revisá su configuración.",
    );
  return (await result.json()).id;
}
export async function accessMail(db, orderId) {
  const now = new Date();
  const order = await db
    .collection("orders")
    .findOneAndUpdate(
      {
        _id: orderId,
        status: "approved",
        mailStatus: { $ne: "sent" },
        $or: [{ mailLock: { $exists: false } }, { mailLock: { $lt: now } }],
      },
      {
        $set: { mailLock: new Date(Date.now() + 60000), mailStatus: "sending" },
      },
      { returnDocument: "after" },
    );
  if (!order) return;
  try {
    const user = await db.collection("users").findOne({ email: order.email });
    const course = await db
      .collection("courses")
      .findOne({ _id: order.courseId });
    let message = `Hola ${order.name},\n\nTu pago de ${course.title} fue aprobado.\nUsuario: ${order.email}\n\n`;
    if (!user.passwordHash) {
      const secret = token();
      await db
        .collection("users")
        .updateOne(
          { _id: user._id, passwordHash: null },
          {
            $set: {
              activationHash: digest(secret),
              activationExpires: new Date(Date.now() + 48 * 3600000),
            },
          },
        );
      message += `Creá tu contraseña para activar el acceso (el enlace vence en 48 horas):\n${process.env.APP_URL}/#activar/${secret}\n\nSi recibís varios enlaces, usá el último.\n`;
    } else
      message += `Ingresá con tu contraseña habitual:\n${process.env.APP_URL}/#mis-cursos\n`;
    message +=
      "\nSi necesitás otro enlace, usá Recuperar acceso desde la pantalla de ingreso.\n\nAcademia Chéverry";
    const providerId = await sendMail(
      order.email,
      `Tu acceso a ${course.title} — Chéverry`,
      message,
      `access-${orderId}-${token()}`,
    );
    await db
      .collection("orders")
      .updateOne(
        { _id: orderId },
        {
          $set: { mailStatus: "sent", mailSentAt: new Date(), providerId },
          $unset: { mailLock: "", mailError: "" },
        },
      );
  } catch {
    await db
      .collection("orders")
      .updateOne(
        { _id: orderId },
        {
          $set: {
            mailStatus: "failed",
            mailError: "No se confirmó el envío. Reintentá desde el panel.",
          },
          $unset: { mailLock: "" },
        },
      );
  }
}
