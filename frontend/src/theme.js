export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const LOGO_URL = "/logo.png";

export const TEAL = "#2a7a6a";
export const TEAL_LIGHT = "#e8f5f2";
export const TEAL_MID = "#c2e0da";
export const ACCENT = "#4aab93";
export const TEXT = "#2d2926";
export const MUTED = "#7a756f";
export const BORDER = "#d4e8e3";
export const BG = "#f7faf9";
export const WHITE = "#ffffff";

export const UI = {
  es: {
    headerSub: "Diagnóstico de Movilidad Urbana",
    banner: "Herramienta de evaluación — Versión prototipo",
    source: "Basado en el Anexo Capítulo 2 — Guía PMUS Argentina (Sustentar / Ministerio de Transporte)",
    introTitle: "Evaluación de Movilidad Sostenible Municipal",
    introDesc: "Esta herramienta diagnostica el estado de la movilidad urbana en ciudades de América Latina, generando un puntaje de riesgo en 6 dimensiones basado en la metodología de la Guía PMUS Argentina (Sustentar / Ministerio de Transporte).",     cityPlaceholder: "— Seleccionar ciudad —",
    startBtn: "Iniciar diagnóstico ››",
    hint: (q, c) => `${q} preguntas · ${c} dimensiones · ~10 min`,
    progressLabel: (a, t) => `${a} / ${t} respondidas`,
    prevBtn: "‹‹ Anterior",
    nextBtn: "Siguiente ››",
    resultsBtn: "Revisar respuestas ››",
    resultsTitle: "Diagnóstico completado",
    resultsSub: "Resultados por dimensión — Guía PMUS Argentina",
    totalLabel: "Puntaje global",
    methodNote: "Metodología basada en el Anexo Capítulo 2 de la Guía para la Planificación de la Movilidad Urbana Sostenible en Argentina (Sustentar / Ministerio de Transporte, 2023). Puntaje: No=0pts · Parcial=2pts · Sí=3pts · Porcentaje: 0–25%=0 · 25–50%=1 · 50–75%=2 · +75%=3",
    recTitle: "Recomendaciones por resultado",
    rec: [
      { range: "0–25%", action: "Se recomienda revisar qué conjunto de medidas de corto plazo pueden mejorar este indicador de manera perentoria o inmediata." },
      { range: "25–50%", action: "Se recomienda implementar un plan de corto plazo con medidas o acciones que mejoren rápidamente este indicador." },
      { range: "50–75%", action: "Desarrollar un plan de corto/mediano plazo con aquellas acciones necesarias para mejorar este indicador." },
      { range: "75–100%", action: "Desarrollar un plan de mediano/largo plazo con acciones que potencien la movilidad sostenible en su conjunto." },
    ],
    editBtn: "‹‹ Editar respuestas",
    newBtn: "Nuevo diagnóstico",
    riskLow: "Bajo", riskMod: "Moderado", riskHigh: "Alto", riskCrit: "Crítico",
    riskPrefix: "Riesgo ",
    pts: "pts",
    downloadBtn: "Descargar informe",
  },
  en: {
    headerSub: "Urban Mobility Diagnostic",
    banner: "Assessment tool — Prototype version",
    source: "Based on Annex Chapter 2 — SUMP Guide Argentina (Sustentar / Ministry of Transport)",
    introTitle: "Municipal Sustainable Mobility Assessment",
    introDesc: "This tool diagnoses the state of urban mobility in Latin American cities, generating a risk score across 6 dimensions based on the methodology of the PMUS Argentina Guide (Sustentar / Ministry of Transport).",    cityLabel: "City to assess",
    cityPlaceholder: "— Select a city —",
    startBtn: "Start diagnostic ››",
    hint: (q, c) => `${q} questions · ${c} dimensions · ~10 min`,
    progressLabel: (a, t) => `${a} / ${t} answered`,
    prevBtn: "‹‹ Previous",
    nextBtn: "Next ››",
    resultsBtn: "Review answers ››",
    resultsTitle: "Diagnostic complete",
    resultsSub: "Results by dimension — SUMP Guide Argentina",
    totalLabel: "Overall score",
    methodNote: "Methodology based on Annex Chapter 2 of the Sustainable Urban Mobility Planning Guide for Argentina (Sustentar / Ministry of Transport, 2023). Scoring: No=0pts · Partial=2pts · Yes=3pts · Percentage: 0–25%=0 · 25–50%=1 · 50–75%=2 · >75%=3",
    recTitle: "Recommendations by result",
    rec: [
      { range: "0–25%", action: "Review which short-term measures can urgently improve this indicator." },
      { range: "25–50%", action: "Implement a short-term plan with actions that quickly improve this indicator." },
      { range: "50–75%", action: "Develop a short/medium-term plan with the actions needed to improve this indicator." },
      { range: "75–100%", action: "Develop a medium/long-term plan with actions that enhance sustainable mobility as a whole." },
    ],
    editBtn: "‹‹ Edit answers",
    newBtn: "New diagnostic",
    riskLow: "Low", riskMod: "Moderate", riskHigh: "High", riskCrit: "Critical",
    riskPrefix: "Risk: ",
    pts: "pts",
    downloadBtn: "Download report",
  },
};