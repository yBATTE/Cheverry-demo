export const defaultCourses = [
  {
    id: "papeleria-automotor",
    title: "Papelería automotor",
    summary:
      "Informe de dominio, seña y recibo de reserva. Entendé qué revisar antes de avanzar con una operación.",
    audience: "Para quienes empiezan a comprar y vender vehículos.",
    syllabus: [
      "Método Cheverry",
      "Antes de comprar",
      "Seña para reservar",
      "Recibo de seña",
      "Informe histórico de dominio",
    ],
    available: false,
    price: null,
  },
  {
    id: "venta-de-vehiculos",
    title: "Venta de vehículos",
    summary:
      "El próximo paso para desarrollar tu actividad comercial en el mercado automotor.",
    audience:
      "Para quienes buscan mejorar la presentación, atención y venta de vehículos.",
    syllabus: [],
    available: false,
    price: null,
  },
  {
    id: "tu-propia-concesionaria",
    title: "Tu propia concesionaria",
    summary:
      "Una formación pensada para quienes quieren construir y organizar su propio negocio.",
    audience: "Para quienes quieren dar el salto hacia una concesionaria.",
    syllabus: [],
    available: false,
    price: null,
  },
];
export const money = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
