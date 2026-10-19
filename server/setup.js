import { readFile } from "node:fs/promises";
import { Binary } from "mongodb";
import { database, indexes } from "./db.js";
import { hashPassword, email, token, assert } from "./security.js";
import { lessons } from "../private/lessons.js";
const { client, db } = await database();
try {
  // Refuse standalone MongoDB before writing anything.
  const hello = await db.admin().command({ hello: 1 });
  assert(
    hello.setName || hello.msg === "isdbgrid",
    400,
    "Usá MongoDB Atlas o un replica set para las transacciones.",
  );
  const address = email(process.env.ADMIN_EMAIL);
  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
  await indexes(db);
  await db
    .collection("users")
    .updateOne(
      { email: address },
      {
        $setOnInsert: {
          _id: token(),
          email: address,
          name: "Administrador Chéverry",
          role: "admin",
          passwordHash,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  const price = Number(process.env.COURSE_PAPELERIA_PRICE) || null;
  const catalog = [
    {
      _id: "papeleria-automotor",
      position: 1,
      title: "Papelería automotor",
      summary:
        "Entendé los documentos que acompañan cada operación y aprendé qué revisar antes de avanzar.",
      audience:
        "Para quienes quieren empezar a comprar y vender vehículos con una base ordenada.",
      syllabus: lessons.map((l) => l.title),
      price,
      available: Boolean(
        price > 0 && process.env.PAYMENT_ALIAS && process.env.PAYMENT_HOLDER,
      ),
      lessons: lessons.map((l, i) => ({
        ...l,
        materialId: i < 3 ? `papeleria-${i}` : null,
      })),
    },
    {
      _id: "venta-de-vehiculos",
      position: 2,
      title: "Venta de vehículos",
      summary:
        "El próximo paso para desarrollar tu actividad comercial en el mercado automotor.",
      audience:
        "Para quienes buscan mejorar la presentación, atención y venta de vehículos.",
      syllabus: [],
      price: null,
      available: false,
      lessons: [],
    },
    {
      _id: "tu-propia-concesionaria",
      position: 3,
      title: "Tu propia concesionaria",
      summary:
        "Una formación pensada para quienes quieren dar el salto y construir su propio negocio.",
      audience:
        "Para quienes quieren organizar y desarrollar una concesionaria.",
      syllabus: [],
      price: null,
      available: false,
      lessons: [],
    },
  ];
  for (const course of catalog)
    await db
      .collection("courses")
      .updateOne({ _id: course._id }, { $set: course }, { upsert: true });
  for (let i = 0; i < 3; i++)
    await db
      .collection("materials")
      .updateOne(
        { _id: `papeleria-${i}` },
        {
          $set: {
            courseId: "papeleria-automotor",
            mime: "image/webp",
            bytes: new Binary(
              await readFile(
                new URL(
                  `../private/materials/material-${i}.webp`,
                  import.meta.url,
                ),
              ),
            ),
          },
        },
        { upsert: true },
      );
  console.log(
    "Configuración completa. Administrador, catálogo y materiales preparados. No se modificaron contraseñas existentes.",
  );
} finally {
  await client.close();
}
