import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// Load Lato from Google Fonts
if (typeof document !== "undefined" && !document.getElementById("sustentar-fonts")) {
  const link = document.createElement("link");
  link.id = "sustentar-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;900&display=swap";
  document.head.appendChild(link);
}


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const LOGO_URL = "/logo.png";

const TEAL = "#2a7a6a";
const TEAL_LIGHT = "#e8f5f2";
const TEAL_MID = "#c2e0da";
const ACCENT = "#4aab93";
const TEXT = "#2d2926";
const MUTED = "#7a756f";
const BORDER = "#d4e8e3";
const BG = "#f7faf9";
const WHITE = "#ffffff";

const UI = {
  es: {
    headerSub: "Diagnóstico de Movilidad Urbana",
    banner: "Herramienta de evaluación — Versión prototipo",
    source: "Basado en el Anexo Capítulo 2 — Guía PMUS Argentina (Sustentar / Ministerio de Transporte)",
    introTitle: "Evaluación de Movilidad Sostenible Municipal",
    introDesc: "Esta herramienta permite diagnosticar el estado de la movilidad urbana en ciudades argentinas, generando un puntaje de riesgo por dimensión basado en la metodología de la Guía PMUS.",
    cityLabel: "Ciudad a evaluar",
    cityPlaceholder: "— Seleccionar ciudad —",
    startBtn: "Iniciar diagnóstico →",
    hint: (q, c) => `${q} preguntas · ${c} dimensiones · ~10 min`,
    progressLabel: (a, t) => `${a} / ${t} respondidas`,
    prevBtn: "← Anterior",
    nextBtn: "Siguiente →",
    resultsBtn: "Revisar respuestas →",
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
    editBtn: "← Editar respuestas",
    newBtn: "Nuevo diagnóstico",
    riskLow: "Bajo", riskMod: "Moderado", riskHigh: "Alto", riskCrit: "Crítico",
    riskPrefix: "Riesgo ",
    pts: "pts",
  },
  en: {
    headerSub: "Urban Mobility Diagnostic",
    banner: "Assessment tool — Prototype version",
    source: "Based on Annex Chapter 2 — SUMP Guide Argentina (Sustentar / Ministry of Transport)",
    introTitle: "Municipal Sustainable Mobility Assessment",
    introDesc: "This tool diagnoses the state of urban mobility in Argentine cities, generating a risk score per dimension based on the SUMP Guide methodology.",
    cityLabel: "City to assess",
    cityPlaceholder: "— Select a city —",
    startBtn: "Start diagnostic →",
    hint: (q, c) => `${q} questions · ${c} dimensions · ~10 min`,
    progressLabel: (a, t) => `${a} / ${t} answered`,
    prevBtn: "← Previous",
    nextBtn: "Next →",
    resultsBtn: "Review answers →",
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
    editBtn: "← Edit answers",
    newBtn: "New diagnostic",
    riskLow: "Low", riskMod: "Moderate", riskHigh: "High", riskCrit: "Critical",
    riskPrefix: "Risk: ",
    pts: "pts",
  },
};

function getRiskLevel(pct, lang) {
  const t = UI[lang];
  if (pct >= 75) return { label: t.riskLow, color: "#1a7a4a", bg: "#dcf5e7", dot: "#22c55e" };
  if (pct >= 50) return { label: t.riskMod, color: "#8a6200", bg: "#fef3c7", dot: "#f59e0b" };
  if (pct >= 25) return { label: t.riskHigh, color: "#9a3a00", bg: "#ffedd5", dot: "#f97316" };
  return { label: t.riskCrit, color: "#9a1a1a", bg: "#fee2e2", dot: "#ef4444" };
}

function RadialScore({ pct, color, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth="7" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize="13" fontWeight="700" fill={color} fontFamily="sans-serif">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div style={s.langToggle}>
      <button style={{ ...s.langBtn, ...(lang === "es" ? s.langBtnActive : {}) }} onClick={() => setLang("es")}>ES</button>
      <button style={{ ...s.langBtn, ...(lang === "en" ? s.langBtnActive : {}) }} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

function Header({ lang, setLang, onHelp }) {
  return (
    <div style={s.header}>
      <img src={LOGO_URL} alt="Sustentar" style={s.logoImg} />
      <div style={s.headerDiv} />
      <span style={s.headerSub}>{UI[lang].headerSub}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {onHelp && (
          <button style={s.helpBtn} onClick={onHelp} title={lang === "es" ? "Cómo usar" : "How to use"}>?</button>
        )}
        <LangToggle lang={lang} setLang={setLang} />
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [step, setStep] = useState("intro");
  const [userRole, setUserRole] = useState(null);
  const [citySize, setCitySize] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [introTab, setIntroTab] = useState("tool");
  const [catIdx, setCatIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [cityName, setCityName] = useState("");
  const [selectedTile, setSelectedTile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmResult, setOsmResult] = useState(null);
  const [fbCity, setFbCity] = useState("");
  const [fbName, setFbName] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);

  // API data state
  const [apiCities, setApiCities] = useState(null);
  const [apiQuestions, setApiQuestions] = useState(null);
  const [apiMeasures, setApiMeasures] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch all data from Supabase on mount and when lang changes
  useEffect(() => {
    async function fetchAll() {
      setApiLoading(true);
      try {
        // Cities
        const { data: citiesRaw } = await supabase
          .from("cities").select("name, country").order("country").order("name");
        const grouped = {};
        citiesRaw.forEach(({ name, country }) => {
          if (!grouped[country]) grouped[country] = [];
          grouped[country].push(name);
        });
        setApiCities(Object.entries(grouped).map(([country, cities]) => ({ country, cities })));

        // Questions with options
        const { data: cats } = await supabase
          .from("categories").select("*").order("sort_order");
        const { data: qs } = await supabase
          .from("questions").select("*").order("sort_order");
        const { data: opts } = await supabase
          .from("question_options").select("*").order("sort_order");

        const optsMap = {};
        opts.forEach(o => {
          if (!optsMap[o.question_id]) optsMap[o.question_id] = [];
          optsMap[o.question_id].push({ label: o[`label_${lang}`], score: o.score });
        });
        const qsMap = {};
        qs.forEach(q => {
          if (!qsMap[q.category_slug]) qsMap[q.category_slug] = [];
          qsMap[q.category_slug].push({ id: q.question_id, text: q[`text_${lang}`], options: optsMap[q.question_id] || [] });
        });
        setApiQuestions(cats.map(c => ({
          id: c.slug, label: c[`label_${lang}`], maxScore: c.max_score,
          questions: qsMap[c.slug] || []
        })));

        // Measures
        const { data: groups } = await supabase
          .from("measure_groups").select("*").order("sort_order");
        const { data: measures } = await supabase
          .from("measures").select("*");
        const measuresMap = {};
        measures.forEach(m => {
          if (!measuresMap[m.group_letter]) measuresMap[m.group_letter] = [];
          measuresMap[m.group_letter].push({
            code: m.code,
            name: { es: m.name_es, en: m.name_en },
            desc: { es: m.desc_es, en: m.desc_en },
            tipos: m[`tipos_${lang}`],
            horizonte: { es: m.horizonte_es, en: m.horizonte_en },
            costo: { es: m.costo_es, en: m.costo_en },
            ambito: { es: m.ambito_es, en: m.ambito_en },
            ecm: { es: m.ecm_es, en: m.ecm_en },
            diagCats: m.diag_cats,
          });
        });
        setApiMeasures(groups.map(g => ({
          group: g.group_letter,
          label: { es: g.label_es, en: g.label_en },
          color: g.color, bg: g.bg, light: g.light,
          measures: measuresMap[g.group_letter] || []
        })));

      } catch (e) {
        console.warn("Supabase fetch failed:", e);
        setApiError(true);
      }
      setApiLoading(false);
    }
    fetchAll();
  }, [lang]);

  const CITIES_DATA = apiCities || [];
  const CATEGORIES_DATA = apiQuestions || [];
  const MEASURES_DATA = apiMeasures || [];

  async function fetchOSMData() {
    if (!cityName) return;
    setOsmLoading(true);
    setOsmResult(null);

    const base = cityName.split(",")[0].trim();

    // Simulate brief loading pause
    await new Promise(r => setTimeout(r, 1200));

    let osmData = null;

    // Try Supabase first
    try {
      const { data } = await supabase
        .from("osm_demo_data")
        .select("*")
        .eq("city_name", base)
        .single();
      if (data) {
        osmData = {
          cycleways: data.cycleways,
          bikeParking: data.bike_parking,
          bikeShare: data.bike_share,
          pedestrian: data.pedestrian,
          busStops: data.bus_stops
        };
      }
    } catch (e) {
      console.warn("Supabase OSM fetch failed, using local demo data");
    }

    if (!osmData) {
      // For cities without demo data, show a friendly message
      setOsmResult({ error: true, errorMsg: lang === "es"
        ? `Datos no disponibles para ${base}. En la versión final se conectará con OpenStreetMap en tiempo real.`
        : `Data not available for ${base}. The final version will connect to OpenStreetMap in real time.`
      });
      setOsmLoading(false);
      return;
    }

    const { cycleways, bikeParking, bikeShare, pedestrian, busStops } = osmData;

    const score = (val, thresholds) => {
      for (const [min, pts] of thresholds) { if (val >= min) return pts; }
      return 0;
    };

    const fields = [
      { id: "ma6", label: lang === "es" ? "Red de vías ciclistas"       : "Cycling infrastructure", value: cycleways,   unit: lang === "es" ? "segmentos" : "segments", score: score(cycleways,   [[50,3],[10,2],[1,2],[0,0]]) },
      { id: "ma7", label: lang === "es" ? "Estacionamiento bicicletas"  : "Bicycle parking",         value: bikeParking, unit: lang === "es" ? "puntos"    : "nodes",    score: score(bikeParking, [[20,3],[5,3],[1,2],[0,0]]) },
      { id: "ma8", label: lang === "es" ? "Bicicletas públicas"          : "Bike-share stations",    value: bikeShare,   unit: lang === "es" ? "estaciones" : "stations", score: score(bikeShare,   [[3,3],[1,3],[0,0]]) },
      { id: "ma2", label: lang === "es" ? "Calles peatonales"           : "Pedestrian streets",      value: pedestrian,  unit: lang === "es" ? "tramos"    : "ways",     score: score(pedestrian,  [[20,3],[5,3],[1,2],[0,0]]) },
      { id: "tp1", label: lang === "es" ? "Red de transporte público"   : "Public transport network", value: busStops,    unit: lang === "es" ? "paradas"   : "stops",    score: score(busStops,    [[20,3],[5,3],[1,2],[0,0]]) },
    ];

    const newAnswers = {};
    fields.forEach(f => { newAnswers[f.id] = f.score; });

    // Fill remaining questions with reasonable demo values so results page is complete
    const demoRemainder = {
      n1:3, n2:3, n3:0, n4:3, n5:0, n6:0, n7:0,
      p1:0, p2:0, p3:3, p4:3, p5:0, p6:3, p7:0, p8:0, p9:0, p10:0,
      ma1:0, ma3:1, ma4:3, ma5:0,
      tp2:2, tp3:3, tp4:1, tp5:0, tp6:0, tp7:2, tp8:3, tp9:0, tp10:3,
      tec1:0, tec2:0, tec3:3, tec4:0, tec5:0,
      sv1:0, sv2:3, sv3:2, sv4:3, sv5:0, sv6:3, sv7:3, sv8:2, sv9:0, sv10:2, sv11:2, sv12:0,
    };

    setAnswers({ ...demoRemainder, ...newAnswers });
    setOsmResult({ filledCount: fields.length, fields, city: base, isDemo: true });
    setOsmLoading(false);
    setStep("quiz");
  }

  const t = UI[lang];
  const cats = CATEGORIES_DATA;
  const totalQ = cats.flatMap((c) => c.questions).length;
  const answered = Object.keys(answers).length;
  const currentCat = cats[catIdx];
  const catDone = currentCat?.questions.every((q) => answers[q.id] !== undefined);

  function answer(qId, score) { setAnswers((p) => ({ ...p, [qId]: score })); }

  function catPct(cat) {
    const raw = cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return Math.round((raw / cat.maxScore) * 100);
  }

  function catRaw(cat) {
    return cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  }

  function totalPct() {
    const totalMax = cats.reduce((sum, c) => sum + c.maxScore, 0);
    const raw = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((raw / totalMax) * 100);
  }

  function submitFeedback() {
    if (!fbMessage.trim()) return;
    supabase.from("feedback").insert({
      city: fbCity, name: fbName, message: fbMessage
    }).then(() => {}).catch(() => {});
    setFbSubmitted(true);
  }

    function reset() { setStep("intro"); setAnswers({}); setCatIdx(0); setCityName(""); setSelectedTile(null); setUserRole(null); setCitySize(null); setFbSubmitted(false); }

  function getSuggestedMeasures() {
    const lowCats = cats.filter((cat) => {
      const raw = cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
      return Math.round((raw / cat.maxScore) * 100) < 50;
    }).map(c => c.id);

    // Use diagCats field from each measure to find relevant ones
    const result = [];
    for (const grp of MEASURES_DATA) {
      const matches = grp.measures.filter(m =>
        m.diagCats && m.diagCats.some(cat => lowCats.includes(cat))
      );
      if (matches.length === 0) continue;
      const limit = result.length === 0 ? 2 : 1;
      result.push(...matches.slice(0, limit));
      if (result.length >= 6) break;
    }
    return result.slice(0, 6);
  }

  function skipToResults() {
    setStep("review");
  }

  const ONBOARDING = {
    es: {
      title: "Guía de uso",
      sub: "Esta herramienta digitaliza el autodiagnóstico de la Guía PMUS Argentina. Antes de empezar, aquí te explicamos cómo está estructurada.",
      sections: [
        { label: "Diagnóstico por dimensión", desc: "El cuestionario evalúa 6 dimensiones institucionales de la movilidad: Normativa, Planificación, Movilidad Activa, Transporte Público, Tecnología y Seguridad Vial. Cada respuesta suma puntos según la escala de la Guía." },
        { label: "Sistema de puntaje", desc: "Sí = 3 pts · Parcial = 2 pts · No = 0 pts · Porcentaje: 0–25% = 0, 25–50% = 1, 50–75% = 2, +75% = 3. El puntaje final por dimensión indica el nivel de riesgo: Bajo (≥75%), Moderado (50–75%), Alto (25–50%), Crítico (<25%)." },
        { label: "Catálogo de medidas (A–G)", desc: "El panel derecho muestra las 33 medidas de la Guía PMUS organizadas en 7 grupos temáticos (A: Movilidad de pie, B: Bicicletas, C: Transporte Público, D: Gestión Vial, E: Carga, F: Tecnología, G: Desarrollo Urbano). Haz clic en cualquier código para ver su descripción." },
        { label: "Recomendaciones post-diagnóstico", desc: "Al finalizar el cuestionario, el sistema identificará automáticamente las dimensiones con puntaje inferior al 50% y sugerirá las medidas PMUS más relevantes para mejorar esos indicadores." },
      ],
      cardTitle: "Estructura de cada medida",
      cardItems: [
        { label: "Identificador", desc: "Código único (ej. A1, B3, C2)" },
        { label: "Tipos de intervención", desc: "Infraestructura · Legales y/o Regulatorios · Servicios · Comunicación" },
        { label: "Horizonte de implementación", desc: "Corto / Mediano / Largo plazo" },
        { label: "Costo económico", desc: "Bajo / Medio / Alto" },
        { label: "Ámbito de aplicación", desc: "RMBA · Grandes Aglomerados · Ciudades intermedias · Localidades pequeñas" },
        { label: "Enfoque ECM", desc: "Evitar viajes motorizados · Cambiar a modos sostenibles · Mejorar eficiencia" },
      ],
      btn: "Entendido, comenzar →",
    },
    en: {
      title: "How to use this tool",
      sub: "This tool digitises the self-assessment from the Argentina SUMP Guide. Here is how it is structured before you begin.",
      sections: [
        { label: "Assessment by dimension", desc: "The questionnaire evaluates 6 institutional mobility dimensions: Regulations, Planning, Active Mobility, Public Transport, Technology and Road Safety. Each answer adds points on the Guide's scoring scale." },
        { label: "Scoring system", desc: "Yes = 3 pts · Partial = 2 pts · No = 0 pts · Percentage: 0–25% = 0, 25–50% = 1, 50–75% = 2, >75% = 3. The final score per dimension indicates risk level: Low (≥75%), Moderate (50–75%), High (25–50%), Critical (<25%)." },
        { label: "Measures catalogue (A–G)", desc: "The right panel shows the 33 SUMP Guide measures in 7 thematic groups (A: Walking, B: Cycling, C: Public Transport, D: Road Management, E: Freight, F: Technology, G: Urban Development). Click any code to see its description." },
        { label: "Post-assessment recommendations", desc: "After completing the questionnaire, the system will identify dimensions scoring below 50% and automatically suggest the most relevant SUMP measures to address those gaps." },
      ],
      cardTitle: "Structure of each measure card",
      cardItems: [
        { label: "Identifier", desc: "Unique code (e.g. A1, B3, C2)" },
        { label: "Intervention types", desc: "Infrastructure · Legal / Regulatory · Services · Communication" },
        { label: "Implementation timeline", desc: "Short / Medium / Long term" },
        { label: "Economic cost", desc: "Low / Medium / High" },
        { label: "Area of application", desc: "Metro Area · Large Agglomerations · Mid-size cities · Small towns" },
        { label: "ECM framework", desc: "Avoid motorised trips · Shift to sustainable modes · Improve efficiency" },
      ],
      btn: "Got it, start →",
    },
  };

  // ── SINGLE UNIFIED RETURN ────────────────────────────────────
  const isQuizActive = step !== "intro";

  return (
    <div style={s.siteWrapper}>

      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <div style={s.onboardOverlay}>
          <div style={s.onboardBox}>
            <div style={s.onboardHeader}>
              <img src={LOGO_URL} alt="Sustentar" style={{ height: 26, objectFit: "contain" }} />
              <div style={s.onboardHeaderDiv} />
              <span style={s.onboardHeaderSub}>{ONBOARDING[lang].title}</span>
              <div style={{ marginLeft: "auto" }}><LangToggle lang={lang} setLang={setLang} /></div>
            </div>
            <p style={s.onboardSub}>{ONBOARDING[lang].sub}</p>
            <div style={s.onboardGrid}>
              <div>
                <div style={s.onboardSectionTitle}>{lang === "es" ? "Cómo funciona" : "How it works"}</div>
                {ONBOARDING[lang].sections.map((sec, i) => (
                  <div key={i} style={s.onboardSection}>
                    <div style={s.onboardNumBadge}>{i + 1}</div>
                    <div>
                      <div style={s.onboardSecLabel}>{sec.label}</div>
                      <div style={s.onboardSecDesc}>{sec.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={s.onboardSectionTitle}>{ONBOARDING[lang].cardTitle}</div>
                <div style={s.onboardCard}>
                  <div style={s.onboardCardCode}>A1</div>
                  <div style={s.onboardCardTitle}>{lang === "es" ? "Red peatonal y caminabilidad" : "Pedestrian network & walkability"}</div>
                  <div style={s.onboardCardDivider} />
                  {ONBOARDING[lang].cardItems.map((item, i) => (
                    <div key={i} style={s.onboardCardRow}>
                      <div style={s.onboardCardRowLabel}>{item.label}</div>
                      <div style={s.onboardCardRowDesc}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button style={s.onboardBtn} onClick={() => setShowOnboarding(false)}>{ONBOARDING[lang].btn}</button>
          </div>
        </div>
      )}

      {/* TILE MODAL */}
      {selectedTile && (
        <div style={s.tileModal} onClick={() => setSelectedTile(null)}>
          <div style={{ ...s.tileModalBox, borderTop: `4px solid ${selectedTile.groupColor}`, background: selectedTile.groupLight }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ ...s.tileModalCode, color: selectedTile.groupColor }}>{selectedTile.code}</span>
              <button style={s.tileModalClose} onClick={() => setSelectedTile(null)}>✕</button>
            </div>
            <div style={s.tileModalName}>{selectedTile.name[lang]}</div>
            <p style={s.tileModalDesc}>{selectedTile.desc[lang]}</p>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <header style={s.stickyHeader}>
        <div style={s.headerInner}>
          <img src={LOGO_URL} alt="Sustentar" style={{ height: 28, objectFit: "contain", cursor: "pointer" }} onClick={reset} />
          {isQuizActive && cityName && (
            <span style={s.navCityBadge}>{cityName}</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {isQuizActive && (
              <button style={s.navRestartBtn} onClick={reset}>
                {lang === "es" ? "← Inicio" : "← Home"}
              </button>
            )}
            <button style={s.helpBtn} onClick={() => setShowOnboarding(true)} title={lang === "es" ? "Cómo usar" : "How to use"}>?</button>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      {/* HERO — intro only */}
      {step === "intro" && (
        <section style={s.heroSection}>
          <div style={s.heroInner}>
            <div style={s.heroBadge}>{lang === "es" ? "Guía PMUS Argentina · Versión prototipo" : "PMUS Argentina Guide · Prototype version"}</div>
            <h1 style={s.heroTitle}>{lang === "es" ? "Evaluación de Movilidad Sostenible Municipal" : "Municipal Sustainable Mobility Assessment"}</h1>
            <p style={s.heroSub}>{lang === "es" ? "Diagnóstico del estado de la movilidad urbana basado en la metodología de la Guía PMUS Argentina, co-elaborada por Sustentar y el Ministerio de Transporte de la Nación." : "Urban mobility diagnostic based on the methodology of the PMUS Argentina Guide, co-authored by Sustentar and the Ministry of Transport."}</p>
            <div style={s.heroStats}>
              <div style={s.heroStat}><span style={s.heroStatNum}>52</span><span style={s.heroStatLabel}>{lang === "es" ? "Preguntas" : "Questions"}</span></div>
              <div style={s.heroStatDiv} />
              <div style={s.heroStat}><span style={s.heroStatNum}>6</span><span style={s.heroStatLabel}>{lang === "es" ? "Dimensiones" : "Dimensions"}</span></div>
              <div style={s.heroStatDiv} />
              <div style={s.heroStat}><span style={s.heroStatNum}>33</span><span style={s.heroStatLabel}>{lang === "es" ? "Medidas PMUS" : "PMUS Measures"}</span></div>
            </div>
            <a href="#herramienta" style={s.heroScrollBtn}>{lang === "es" ? "Comenzar diagnóstico" : "Start assessment"}</a>
          </div>
        </section>
      )}

      {/* TOOL SECTION */}
      <section id="herramienta" style={s.toolSection}>

        {/* INTRO */}
        {step === "intro" && (
          <div style={{ maxWidth: 680, width: "100%" }}>
            <div style={s.card}>
              <div style={s.banner}><span style={s.bannerDot} />{t.banner}</div>
              <h1 style={s.h1}>{t.introTitle}</h1>
              <p style={s.desc}>{t.introDesc}</p>
              <div style={{ ...s.sourceNote, marginBottom: 20 }}>{t.source}</div>

              {/* TABS */}
              <div style={s.introTabBar}>
                {[
                  { id: "tool", es: "Sobre la herramienta", en: "About the tool" },
                  { id: "measures", es: "Medidas PMUS", en: "PMUS Measures" },
                ].map(tab => (
                  <button key={tab.id}
                    style={{ ...s.introTabBtn, ...(introTab === tab.id ? s.introTabBtnActive : {}) }}
                    onClick={() => setIntroTab(tab.id)}>
                    {tab[lang]}
                  </button>
                ))}
              </div>

              {/* TAB: ABOUT THE TOOL */}
              {introTab === "tool" && (
                <div style={s.introTabContent}>
                  <div style={s.chips}>{cats.map((c) => <span key={c.id} style={s.chip}>{c.label}</span>)}</div>
                  <label style={{ ...s.label, marginTop: 4 }}>{t.cityLabel}</label>
                  <select style={s.select} value={cityName} onChange={(e) => setCityName(e.target.value)}>
                    <option value="">{t.cityPlaceholder}</option>
                    {CITIES_DATA.map(g => (
                      <optgroup key={g.country} label={g.country}>
                        {g.cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <button style={{ ...s.btnPrimary, opacity: cityName.trim() ? 1 : 0.4, cursor: cityName.trim() ? "pointer" : "default" }}
                    disabled={!cityName.trim()} onClick={() => setStep("role")}>
                    {t.startBtn}
                  </button>
                  {cityName.trim() && (
                    <div style={s.osmPanel}>
                      <div style={s.osmPanelTop}>
                        <div>
                          <div style={s.osmPanelTitle}>{lang === "es" ? "Pre-completar desde OpenStreetMap" : "Pre-fill from OpenStreetMap"}</div>
                          <div style={s.osmPanelSub}>{lang === "es" ? "Datos espaciales reales para 5 preguntas de movilidad activa y transporte" : "Real spatial data for 5 active mobility & transport questions"}</div>
                        </div>
                        <button style={{ ...s.osmBtn, opacity: osmLoading ? 0.6 : 1, cursor: osmLoading ? "default" : "pointer" }} disabled={osmLoading} onClick={fetchOSMData}>
                          {osmLoading ? (lang === "es" ? "Consultando..." : "Querying...") : (lang === "es" ? "Analizar ciudad" : "Analyse city")}
                        </button>
                      </div>
                      {osmResult && !osmResult.error && (
                        <div style={s.osmResult}>
                          <div style={s.osmResultTitle}>{lang === "es" ? `${osmResult.filledCount} respuestas completadas automáticamente para ${osmResult.city}` : `${osmResult.filledCount} answers auto-filled for ${osmResult.city}`}</div>
                          <div style={s.osmResultGrid}>
                            {osmResult.fields.map(f => (
                              <div key={f.id} style={s.osmResultRow}>
                                <span style={s.osmResultLabel}>{f.label}</span>
                                <span style={s.osmResultVal}>{f.value} {f.unit}</span>
                                <span style={{ ...s.osmResultScore, background: f.score === 3 ? "#dcf5e7" : f.score === 2 ? "#fef3c7" : "#fee2e2", color: f.score === 3 ? "#1a7a4a" : f.score === 2 ? "#8a6200" : "#9a1a1a" }}>{f.score} pts</span>
                              </div>
                            ))}
                          </div>
                          <div style={s.osmAttrib}>{osmResult.isDemo ? (lang === "es" ? "Datos de demostración basados en OpenStreetMap · overpass-api.de" : "Demo data based on OpenStreetMap · overpass-api.de") : "Fuente: OpenStreetMap contributors · overpass-api.de"}</div>
                        </div>
                      )}
                      {osmResult?.error && (
                        <div style={{ ...s.osmAttrib, color: "#c94040", marginTop: 8 }}>{osmResult.errorMsg}</div>
                      )}
                    </div>
                  )}
                  <p style={s.hint}>{t.hint(totalQ, cats.length)}</p>
                </div>
              )}

              {/* TAB: PMUS MEASURES */}
              {introTab === "measures" && (
                <div style={s.introTabContent}>
                  <p style={{ ...s.desc, marginBottom: 16 }}>{lang === "es" ? "Las 33 medidas de la Guía PMUS organizadas en 7 grupos temáticos. Haz clic en cualquier código para ver su descripción." : "The 33 SUMP Guide measures in 7 thematic groups. Click any code to see its description."}</p>
                  {MEASURES_DATA.map(g => (
                    <div key={g.group} style={s.tileGroup}>
                      <div style={{ ...s.tileGroupLabel, color: g.color }}>{g.group} · {typeof g.label === "object" ? g.label[lang] : g.label}</div>
                      <div style={s.tileRow}>
                        {g.measures.map(m => (
                          <button key={m.code}
                            style={{ ...s.tile, background: selectedTile?.code === m.code ? g.color : g.bg, borderColor: g.color + "88", color: selectedTile?.code === m.code ? "#fff" : g.color }}
                            onClick={() => setSelectedTile(selectedTile?.code === m.code ? null : { ...m, groupColor: g.color, groupBg: g.bg, groupLight: g.light })}>
                            {m.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* ROLE SELECTION */}
        {step === "role" && (
          <div style={{ ...s.card, maxWidth: 560 }}>
            <div style={s.stepProgress}>{lang === "es" ? "Paso 1 de 2" : "Step 1 of 2"}</div>
            <h2 style={s.h2}>{lang === "es" ? "¿Quién realiza este diagnóstico?" : "Who is completing this assessment?"}</h2>
            <p style={{ ...s.desc, marginBottom: 24 }}>{lang === "es" ? "Solo para registro — no afecta el puntaje." : "For our records only — does not affect scoring."}</p>
            <div style={s.roleGrid}>
              {[
                { id: "municipio", es: "Municipio / Secretaría de Transporte", en: "Municipality / Transport Department", sub: { es: "Gobierno local responsable de la movilidad urbana", en: "Local government responsible for urban mobility" } },
                { id: "organismo", es: "Organismo provincial o nacional", en: "Provincial or national body", sub: { es: "Entidad pública que evalúa ciudades bajo su jurisdicción", en: "Public entity evaluating cities under its jurisdiction" } },
                { id: "osc", es: "Organización de la sociedad civil / Academia", en: "Civil society organisation / Academia", sub: { es: "ONG, consultora o institución de investigación", en: "NGO, consultancy or research institution" } },
              ].map(r => (
                <button key={r.id}
                  style={{ ...s.roleCard, ...(userRole === r.id ? s.roleCardActive : {}) }}
                  onClick={() => setUserRole(r.id)}>
                  <div style={s.roleCardTitle}>{r[lang]}</div>
                  <div style={s.roleCardSub}>{r.sub[lang]}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button style={s.btnOutline} onClick={() => setStep("intro")}>{lang === "es" ? "← Volver" : "← Back"}</button>
              <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 28px", opacity: userRole ? 1 : 0.4, cursor: userRole ? "pointer" : "default" }} disabled={!userRole} onClick={() => setStep("citysize")}>
                {lang === "es" ? "Siguiente →" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* CITY SIZE SELECTION */}
        {step === "citysize" && (
          <div style={{ ...s.card, maxWidth: 560 }}>
            <div style={s.stepProgress}>{lang === "es" ? "Paso 2 de 2" : "Step 2 of 2"}</div>
            <h2 style={s.h2}>{lang === "es" ? "¿Cuál es el tamaño de la ciudad?" : "What is the size of the city?"}</h2>
            <p style={{ ...s.desc, marginBottom: 24 }}>{lang === "es" ? "Esto adapta los umbrales de evaluación según la Guía PMUS." : "This adapts the assessment thresholds according to the SUMP Guide."}</p>
            <div style={s.roleGrid}>
              {[
                { id: "grande", es: "Gran aglomerado", en: "Large agglomeration", sub: { es: "Más de 500.000 habitantes", en: "More than 500,000 inhabitants" } },
                { id: "intermedia", es: "Ciudad intermedia", en: "Mid-size city", sub: { es: "Entre 50.000 y 500.000 habitantes", en: "Between 50,000 and 500,000 inhabitants" } },
                { id: "pequena", es: "Localidad pequeña", en: "Small town", sub: { es: "Menos de 50.000 habitantes", en: "Less than 50,000 inhabitants" } },
              ].map(r => (
                <button key={r.id}
                  style={{ ...s.roleCard, ...(citySize === r.id ? s.roleCardActive : {}) }}
                  onClick={() => setCitySize(r.id)}>
                  <div style={s.roleCardTitle}>{r[lang]}</div>
                  <div style={s.roleCardSub}>{r.sub[lang]}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button style={s.btnOutline} onClick={() => setStep("role")}>{lang === "es" ? "← Volver" : "← Back"}</button>
              <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 28px", opacity: citySize ? 1 : 0.4, cursor: citySize ? "pointer" : "default" }} disabled={!citySize} onClick={() => setStep("quiz")}>
                {lang === "es" ? "Iniciar diagnóstico →" : "Start assessment →"}
              </button>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {step === "quiz" && (
          <div style={{ ...s.card, maxWidth: 760 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: TEAL, fontSize: 13, fontWeight: 600 }}>{cityName}</span>
              <span style={{ color: MUTED, fontSize: 12 }}>{t.progressLabel(answered, totalQ)}</span>
            </div>
            <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${(answered / totalQ) * 100}%` }} /></div>
            <div style={s.tabRow}>
              {cats.map((c, i) => {
                const done = c.questions.every((q) => answers[q.id] !== undefined);
                const active = i === catIdx;
                return (
                  <button key={c.id} style={{ ...s.tab, ...(active ? s.tabActive : {}), ...(done && !active ? s.tabDone : {}) }} onClick={() => setCatIdx(i)}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{c.id.slice(0,2).toUpperCase()}</span>
                    {done && <span style={s.checkPin}>✓</span>}
                  </button>
                );
              })}
              <span style={s.tabLabel}>{currentCat.label}</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              {currentCat.questions.map((q, qi) => {
                const osmFilled = osmResult && !osmResult.error && osmResult.fields.some(f => f.id === q.id);
                return (
                  <div key={q.id} style={s.qBlock}>
                    <p style={s.qText}>
                      <span style={s.qNum}>{qi + 1}.</span> {q.text}
                      {osmFilled && <span style={s.osmBadge}>OSM</span>}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {q.options.map((opt) => {
                        const sel = answers[q.id] === opt.score;
                        return (
                          <button key={opt.score} style={{ ...s.opt, ...(sel ? s.optSel : {}), ...(sel && osmFilled ? { borderColor: "#0a9ea0", background: "#f0fbfb", color: "#0a7a7a" } : {}) }} onClick={() => answer(q.id, opt.score)}>
                            <span style={{ ...s.radio, ...(sel ? s.radioSel : {}), ...(sel && osmFilled ? { background: "#0a9ea0", borderColor: "#0a9ea0" } : {}) }} />
                            <span style={{ flex: 1 }}>{opt.label}</span>
                            <span style={{ fontSize: 11, color: sel ? (osmFilled ? "#0a9ea0" : TEAL) : MUTED, fontWeight: 600 }}>{opt.score} {t.pts}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button style={s.btnOutline} onClick={reset}>{lang === "es" ? "← Inicio" : "← Home"}</button>
              <button style={{ ...s.btnOutline, opacity: catIdx === 0 ? 0.3 : 1 }} disabled={catIdx === 0} onClick={() => setCatIdx((i) => i - 1)}>{t.prevBtn}</button>
              <button style={{ ...s.btnSkip, marginTop: 0, width: "auto" }} onClick={() => setStep("review")}>{lang === "es" ? "Finalizar →" : "Finalise →"}</button>
              {catIdx < cats.length - 1
                ? <button style={{ ...s.btnPrimary, opacity: 1, cursor: "pointer" }} onClick={() => {
                    const unanswered = currentCat.questions.filter(q => answers[q.id] === undefined).length;
                    if (unanswered > 0) {
                      const msg = lang === "es"
                        ? `Tenés ${unanswered} pregunta${unanswered > 1 ? "s" : ""} sin responder en esta sección. ¿Continuar de todas formas?`
                        : `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""} in this section. Continue anyway?`;
                      if (window.confirm(msg)) setCatIdx((i) => i + 1);
                    } else {
                      setCatIdx((i) => i + 1);
                    }
                  }}>{t.nextBtn}</button>
                : <button style={{ ...s.btnPrimary, opacity: 1, cursor: "pointer" }} onClick={() => {
                    const unanswered = cats.reduce((sum, cat) => sum + cat.questions.filter(q => answers[q.id] === undefined).length, 0);
                    if (unanswered > 0) {
                      const msg = lang === "es"
                        ? `Tenés ${unanswered} pregunta${unanswered > 1 ? "s" : ""} sin responder. ¿Ver resultados de todas formas?`
                        : `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. View results anyway?`;
                      if (window.confirm(msg)) setStep("review");
                    } else {
                      setStep("review");
                    }
                  }}>{t.resultsBtn}</button>
              }
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === "review" && (
          <div style={{ ...s.card, maxWidth: 760 }}>
            <h2 style={s.h2}>{lang === "es" ? "Revisar respuestas" : "Review your answers"}</h2>
            <p style={{ ...s.desc2, marginBottom: 24 }}>{lang === "es" ? "Verificá tus respuestas antes de ver los resultados. Podés volver a cualquier sección para corregir." : "Check your answers before viewing results. You can go back to any section to make changes."}</p>
            {cats.map((cat, ci) => (
              <div key={cat.id} style={s.reviewCatBlock}>
                <div style={s.reviewCatHeader}>
                  <span style={s.reviewCatLabel}>{cat.label}</span>
                  <button style={s.reviewEditBtn} onClick={() => { setCatIdx(ci); setStep("quiz"); }}>{lang === "es" ? "Editar" : "Edit"}</button>
                </div>
                {cat.questions.map((q, qi) => {
                  const ans = answers[q.id];
                  const opt = q.options.find(o => o.score === ans);
                  const unanswered = ans === undefined;
                  return (
                    <div key={q.id} style={{ ...s.reviewRow, background: unanswered ? "#fff5f5" : "#fafafa", borderColor: unanswered ? "#f5c0c0" : BORDER }}>
                      <span style={s.reviewQNum}>{qi + 1}.</span>
                      <span style={{ ...s.reviewQText, flex: 1 }}>{q.text}</span>
                      <span style={{ ...s.reviewAns, color: unanswered ? "#c94040" : TEAL, background: unanswered ? "#fee2e2" : TEAL_LIGHT }}>
                        {unanswered ? (lang === "es" ? "Sin respuesta" : "Unanswered") : opt?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button style={s.btnOutline} onClick={() => { setCatIdx(0); setStep("quiz"); }}>{lang === "es" ? "← Volver al cuestionario" : "← Back to questionnaire"}</button>
              <button style={s.btnPrimary} onClick={() => setStep("results")}>{lang === "es" ? "Confirmar y ver resultados →" : "Confirm & view results →"}</button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === "results" && (() => {
          if (apiLoading || MEASURES_DATA.length === 0) return <div style={{ padding: 40, color: MUTED, fontSize: 13 }}>{lang === "es" ? "Cargando resultados..." : "Loading results..."}</div>;
          const total = totalPct();
          const risk = getRiskLevel(total, lang);
          const fieldLabel = {
            tipos: { es: "Tipo de intervención", en: "Intervention type" },
            horizonte: { es: "Horizonte", en: "Timeline" },
            costo: { es: "Costo económico", en: "Economic cost" },
            ambito: { es: "Ámbito de aplicación", en: "Area of application" },
            ecm: { es: "Enfoque ECM", en: "ECM framework" },
          };
          return (
            <div style={{ ...s.card, maxWidth: 900 }}>
              <div style={s.resultsTop}>
                <div>
                  <span style={s.cityPill}>{cityName}</span>
                  <h2 style={s.h2}>{t.resultsTitle}</h2>
                  <p style={s.desc2}>{t.resultsSub}</p>
                  {osmResult?.isDemo && (
                    <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fbfb", border: "1px solid #b2e4e4", borderRadius: 5, padding: "3px 10px" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0a9ea0", flexShrink: 0, display: "inline-block" }} />
                      <span style={{ color: "#0a6060", fontSize: 11 }}>{lang === "es" ? `${osmResult.filledCount} preguntas pre-completadas desde OpenStreetMap` : `${osmResult.filledCount} questions pre-filled from OpenStreetMap`}</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <RadialScore pct={total} color={risk.dot} size={90} />
                  <div style={{ ...s.badge, background: risk.bg, color: risk.color }}>{t.riskPrefix}{risk.label}</div>
                  <div style={s.totalLbl}>{t.totalLabel}</div>
                </div>
              </div>
              <div style={s.grid}>
                {cats.map((cat) => {
                  const pct = catPct(cat);
                  const raw = catRaw(cat);
                  const r = getRiskLevel(pct, lang);
                  return (
                    <div key={cat.id} style={{ ...s.catCard, borderTop: `3px solid ${r.dot}` }}>
                      <div style={s.catHead}>
                        <div>
                          <div style={s.catName}>{cat.label}</div>
                          <div style={s.catScore}>{raw} / {cat.maxScore} {t.pts}</div>
                          <span style={{ ...s.badgeSm, background: r.bg, color: r.color }}>{r.label}</span>
                        </div>
                        <RadialScore pct={pct} color={r.dot} size={68} />
                      </div>
                      <button
                        style={s.catToggle}
                        onClick={() => setExpandedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}>
                        {expandedCats[cat.id]
                          ? (lang === "es" ? "▲ Ocultar respuestas" : "▲ Hide answers")
                          : (lang === "es" ? "▼ Ver respuestas" : "▼ Show answers")}
                      </button>
                      {expandedCats[cat.id] && (
                        <>
                          <div style={s.sep} />
                          {cat.questions.map((q) => {
                            const a = q.options.find((o) => o.score === answers[q.id]);
                            return (
                              <div key={q.id} style={{ marginBottom: 8 }}>
                                <span style={s.aQ}>{q.text}</span>
                                <span style={s.aA}>{a?.label ?? "—"} <span style={{ color: MUTED, fontWeight: 400 }}>({answers[q.id] ?? 0} {t.pts})</span></span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={s.methodNote}><strong>{lang === "es" ? "Metodología:" : "Methodology:"}</strong> {t.methodNote.replace(/^[^:]+: /, "")}</div>
              <div style={{ ...s.methodNote, background: "#f0f9ff", borderColor: "#bae6fd", marginBottom: 20 }}>
                <strong>{t.recTitle}</strong>
                {t.rec.map((r) => (
                  <div key={r.range} style={{ marginTop: 6 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{r.range}:</span> <span>{r.action}</span>
                  </div>
                ))}
              </div>
              {(() => {
                const suggested = getSuggestedMeasures().slice(0, 6);
                if (suggested.length === 0) return null;
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={s.suggestTitle}>{lang === "es" ? "Medidas recomendadas" : "Recommended measures"}</div>
                    <div style={s.suggestSub}>{lang === "es" ? "Dimensiones con puntaje inferior al 50% — Guía PMUS Argentina" : "Dimensions scoring below 50% — Argentina SUMP Guide"}</div>
                    <div style={s.suggestGrid}>
                      {suggested.map(m => {
                        const grp = MEASURES_DATA.find(g => g.measures.some(x => x.code === m.code));
                        if (!grp) return null;
                        return (
                          <div key={m.code} style={{ ...s.suggestCard, borderTop: `3px solid ${grp.color}`, background: grp.light }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <span style={{ ...s.suggestCardCode, background: grp.color }}>{m.code}</span>
                              <span style={s.suggestCardName}>{m.name[lang]}</span>
                            </div>
                            <p style={s.suggestCardDesc}>{m.desc[lang]}</p>
                            <div style={s.suggestCardDivider} />
                            {[
                              { key: "tipos", val: Array.isArray(m.tipos) ? m.tipos.join(" · ") : null },
                              { key: "horizonte", val: m.horizonte?.[lang] },
                              { key: "costo", val: m.costo?.[lang] },
                              { key: "ambito", val: m.ambito?.[lang] },
                              { key: "ecm", val: m.ecm?.[lang] },
                            ].map(row => row.val ? (
                              <div key={row.key} style={s.suggestCardRow}>
                                <span style={{ ...s.suggestCardRowLabel, color: grp.color }}>{fieldLabel[row.key][lang]}</span>
                                <span style={s.suggestCardRowVal}>{row.val}</span>
                              </div>
                            ) : null)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 12 }}>
                <button style={s.btnOutline} onClick={() => { setAnswers({}); setCatIdx(0); setStep("quiz"); }}>{t.editBtn}</button>
                <button style={s.btnOutline} onClick={() => alert(lang === "es" ? "La descarga del informe estará disponible en la versión final." : "Report download will be available in the final version.")}>{lang === "es" ? "Descargar informe" : "Download report"}</button>
                <button style={s.btnPrimary} onClick={reset}>{t.newBtn}</button>
              </div>
            </div>
          );
        })()}

      </section>

      {/* CONTEXT SECTION */}
      <section style={s.contextSection}>
        <div style={s.contextInner}>
          <div style={s.contextTag}>{lang === "es" ? "Sobre la herramienta" : "About the tool"}</div>
          <h2 style={s.sectionTitle}>{lang === "es" ? "Basado en la Guía PMUS Argentina" : "Based on the PMUS Argentina Guide"}</h2>
          <p style={s.contextText}>{lang === "es" ? "Esta herramienta digitaliza el autodiagnóstico del Plan de Movilidad Urbana Sostenible (PMUS) desarrollado por Asociación Sustentar junto al Ministerio de Transporte de la Nación en 2023. Permite a municipios y autoridades de transporte evaluar su situación actual, identificar brechas y priorizar intervenciones de manera estructurada." : "This tool digitises the self-assessment of the Sustainable Urban Mobility Plan (SUMP) developed by Asociación Sustentar together with Argentina's Ministry of Transport in 2023. It allows municipalities and transport authorities to assess their current situation, identify gaps and prioritise interventions in a structured way."}</p>
          <a href="https://www.asociacionsustentar.org" target="_blank" rel="noreferrer" style={s.contextLink}>{lang === "es" ? "Ver guía completa →" : "View full guide →"}</a>
        </div>
      </section>

      {/* FEEDBACK SECTION */}
      <section style={s.feedbackSection}>
        <div style={s.feedbackInner}>
          <div style={s.contextTag}>{lang === "es" ? "Queremos saber" : "We want to know"}</div>
          <h2 style={s.sectionTitle}>{lang === "es" ? "¿Usaste esta herramienta con tu ciudad?" : "Did you use this tool with your city?"}</h2>
          <p style={s.feedbackSub}>{lang === "es" ? "Tu experiencia y sugerencias nos ayudan a mejorar esta herramienta para más ciudades latinoamericanas. Dejanos un comentario." : "Your experience and suggestions help us improve this tool for more Latin American cities. Leave us a comment."}</p>
          {fbSubmitted ? (
            <div style={s.feedbackSuccess}>{lang === "es" ? "Mensaje enviado. Muchas gracias." : "Message sent. Thank you very much."}</div>
          ) : (
            <div style={s.feedbackForm}>
              <div style={s.feedbackRow}>
                <input style={s.feedbackInput} placeholder={lang === "es" ? "Ciudad" : "City"} value={fbCity} onChange={e => setFbCity(e.target.value)} />
                <input style={s.feedbackInput} placeholder={lang === "es" ? "Nombre o institución" : "Name or institution"} value={fbName} onChange={e => setFbName(e.target.value)} />
              </div>
              <textarea style={s.feedbackTextarea} placeholder={lang === "es" ? "Comentarios, sugerencias o preguntas sobre la herramienta..." : "Comments, suggestions or questions about the tool..."} value={fbMessage} onChange={e => setFbMessage(e.target.value)} rows={4} />
              <button style={{ ...s.btnPrimary, maxWidth: 220, opacity: fbMessage.trim() ? 1 : 0.4, cursor: fbMessage.trim() ? "pointer" : "default" }} disabled={!fbMessage.trim()} onClick={submitFeedback}>
                {lang === "es" ? "Enviar comentario" : "Submit feedback"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.siteFooter}>
        <div style={s.footerInner}>
          <img src={LOGO_URL} alt="Sustentar" style={{ height: 30, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          <p style={s.footerText}>{lang === "es" ? "En nombre de Asociación Sustentar · Buenos Aires, Argentina" : "On behalf of Asociación Sustentar · Buenos Aires, Argentina"}</p>
          <a href="https://www.asociacionsustentar.org" target="_blank" rel="noreferrer" style={s.footerLink}>asociacionsustentar.org</a>
        </div>
      </footer>

    </div>
  );
}

const s = {

  stepProgress: { color: MUTED, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 },
  roleGrid: { display: "flex", flexDirection: "column", gap: 10 },
  roleCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", cursor: "pointer", textAlign: "left", fontFamily: "inherit" },
  roleCardActive: { background: TEAL_LIGHT, borderColor: TEAL },
  roleCardTitle: { color: TEXT, fontSize: 14, fontWeight: 600, marginBottom: 3 },
  roleCardSub: { color: MUTED, fontSize: 12, lineHeight: 1.5 },

  introTabBar: { display: "flex", gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 20, marginTop: 4 },
  introTabBtn: { background: "transparent", border: "none", borderBottom: "2px solid transparent", padding: "8px 16px", fontSize: 12, fontWeight: 500, color: MUTED, cursor: "pointer", fontFamily: "inherit", marginBottom: -1 },
  introTabBtnActive: { color: TEAL, borderBottomColor: TEAL, fontWeight: 700 },
  introTabContent: { },
  // ── LAYOUT ───────────────────────────────────────────────────
  siteWrapper: { minHeight: "100vh", background: BG, fontFamily: "'Lato', 'Helvetica Neue', Arial, sans-serif" },

  // ── STICKY HEADER ────────────────────────────────────────────
  stickyHeader: { position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 0 rgba(42,122,106,0.06)" },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 58, display: "flex", alignItems: "center", gap: 14 },
  navCityBadge: { background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 },
  navRestartBtn: { background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  helpBtn: { width: 28, height: 28, borderRadius: "50%", border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" },
  langToggle: { display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" },
  langBtn: { background: WHITE, color: MUTED, border: "none", padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em" },
  langBtnActive: { background: TEAL, color: WHITE },

  // ── HERO ─────────────────────────────────────────────────────
  heroSection: { background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "72px 40px 64px" },
  heroInner: { maxWidth: 700, margin: "0 auto", textAlign: "center" },
  heroBadge: { display: "inline-block", background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 },
  heroTitle: { color: TEXT, fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: "0 0 20px", letterSpacing: "-0.02em" },
  heroSub: { color: MUTED, fontSize: 13, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 560, marginLeft: "auto", marginRight: "auto" },
  heroStats: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36, background: TEAL_LIGHT, borderRadius: 12, padding: "16px 32px", border: `1px solid ${TEAL_MID}`, display: "inline-flex" },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px" },
  heroStatNum: { color: TEAL, fontSize: 22, fontWeight: 800, lineHeight: 1 },
  heroStatLabel: { color: MUTED, fontSize: 11, marginTop: 4, letterSpacing: "0.05em" },
  heroStatDiv: { width: 1, height: 36, background: TEAL_MID },
  heroScrollBtn: { display: "inline-block", background: TEAL, color: WHITE, borderRadius: 8, padding: "12px 28px", fontWeight: 600, fontSize: 14, textDecoration: "none", letterSpacing: "0.01em" },

  // ── TOOL SECTION ─────────────────────────────────────────────
  toolSection: { padding: "48px 40px 64px", display: "flex", flexDirection: "column", alignItems: "center" },

  // ── CARD ─────────────────────────────────────────────────────
  card: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 40px", maxWidth: 600, width: "100%", boxShadow: "0 2px 20px rgba(42,122,106,0.08)" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` },
  logoImg: { height: 30, objectFit: "contain" },
  headerDiv: { width: 1, height: 22, background: BORDER },
  headerSub: { color: MUTED, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 },
  banner: { display: "flex", alignItems: "center", gap: 8, background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 6, padding: "7px 12px", marginBottom: 12, color: TEAL, fontSize: 12, fontWeight: 500 },
  bannerDot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0 },
  sourceNote: { color: MUTED, fontSize: 11, lineHeight: 1.5, fontStyle: "italic" },
  h1: { color: TEXT, fontSize: 17, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.35 },
  h2: { color: TEXT, fontSize: 16, fontWeight: 700, margin: "6px 0 4px" },
  desc: { color: MUTED, fontSize: 12, lineHeight: 1.7, margin: "0 0 12px" },
  desc2: { color: MUTED, fontSize: 11, margin: 0 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  chip: { background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 500 },
  label: { display: "block", color: TEXT, fontSize: 12, fontWeight: 600, marginBottom: 6 },
  input: { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box", background: WHITE, fontFamily: "inherit", marginBottom: 20 },
  select: { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box", background: WHITE, fontFamily: "inherit", marginBottom: 20, cursor: "pointer", appearance: "auto" },
  btnPrimary: { display: "block", width: "100%", background: TEAL, color: WHITE, border: "none", borderRadius: 7, padding: "12px 24px", fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  btnOutline: { background: WHITE, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 7, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnSkip: { background: "transparent", color: MUTED, border: `1px dashed ${BORDER}`, borderRadius: 7, padding: "8px 14px", fontWeight: 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 8, width: "100%", textAlign: "center" },
  btnRestart: { background: "transparent", color: MUTED, border: "none", padding: "8px 4px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 2 },
  hint: { textAlign: "center", color: MUTED, fontSize: 12, marginTop: 12 },
  progressBar: { height: 5, background: TEAL_LIGHT, borderRadius: 3, marginBottom: 20 },
  progressFill: { height: "100%", background: TEAL, borderRadius: 3, transition: "width 0.3s" },
  tabRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" },
  tab: { background: TEAL_LIGHT, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 8, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  tabActive: { background: TEAL, border: `1px solid ${TEAL}` },
  tabDone: { border: `1px solid ${TEAL_MID}`, opacity: 0.65 },
  checkPin: { position: "absolute", top: -5, right: -5, fontSize: 8, background: ACCENT, color: WHITE, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  tabLabel: { color: TEXT, fontSize: 14, fontWeight: 600, marginLeft: 6 },
  qBlock: { marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` },
  qText: { color: TEXT, fontSize: 12, lineHeight: 1.6, margin: "0 0 10px", fontWeight: 500 },
  qNum: { color: TEAL, fontWeight: 700, marginRight: 4 },
  opt: { background: WHITE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 12px", fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" },
  optSel: { background: TEAL_LIGHT, borderColor: TEAL, color: TEAL },
  radio: { width: 13, height: 13, borderRadius: "50%", border: `2px solid ${BORDER}`, flexShrink: 0 },
  radioSel: { background: TEAL, border: `2px solid ${TEAL}` },
  resultsTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "0 0 24px" },
  cityPill: { display: "inline-block", background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" },
  totalLbl: { color: MUTED, fontSize: 11, marginTop: 4 },
  badge: { display: "inline-block", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, marginTop: 4 },
  badgeSm: { display: "inline-block", borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 700, marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 },
  catCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" },
  catHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  catToggle: { marginTop: 10, background: "transparent", border: "none", color: MUTED, fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "4px 0", textAlign: "left" },
  catName: { color: TEXT, fontSize: 13, fontWeight: 700, margin: "4px 0 2px" },
  catScore: { color: MUTED, fontSize: 11, marginBottom: 4 },
  sep: { height: 1, background: BORDER, margin: "10px 0" },
  aQ: { display: "block", color: MUTED, fontSize: 11, lineHeight: 1.4 },
  aA: { display: "block", color: TEXT, fontSize: 11, fontWeight: 600, marginTop: 1 },
  methodNote: { background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 7, padding: "12px 16px", color: MUTED, fontSize: 12, lineHeight: 1.6, marginBottom: 16 },

  // ── INTRO TWO-COLUMN ─────────────────────────────────────────
  introWrap: { display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 1100, width: "100%", position: "relative" },

  // ── TILES PANEL ──────────────────────────────────────────────
  tilesPanel: { width: 220, flexShrink: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 16px", boxShadow: "0 2px 12px rgba(42,122,106,0.07)" },
  tilesPanelTitle: { color: TEXT, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 },
  tilesPanelSub: { color: MUTED, fontSize: 11, marginBottom: 14 },
  tileGroup: { marginBottom: 12 },
  tileGroupLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 },
  tileRow: { display: "flex", flexWrap: "wrap", gap: 4 },
  tile: { border: "1.5px solid", borderRadius: 5, padding: "3px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  // ── TILE MODAL ───────────────────────────────────────────────
  tileModal: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" },
  tileModalBox: { background: WHITE, borderRadius: 10, padding: "20px 24px", maxWidth: 340, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
  tileModalCode: { fontSize: 22, fontWeight: 800, letterSpacing: "0.04em" },
  tileModalClose: { background: "transparent", border: "none", color: MUTED, fontSize: 16, cursor: "pointer", padding: 0 },
  tileModalName: { color: TEXT, fontSize: 14, fontWeight: 700, marginBottom: 8 },
  tileModalDesc: { color: MUTED, fontSize: 13, lineHeight: 1.6, margin: 0 },

  // ── REVIEW ───────────────────────────────────────────────────
  reviewCatBlock: { marginBottom: 20 },
  reviewCatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` },
  reviewCatLabel: { color: TEXT, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" },
  reviewEditBtn: { background: "transparent", color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 5, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  reviewRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, marginBottom: 5 },
  reviewQNum: { color: MUTED, fontSize: 11, fontWeight: 600, flexShrink: 0, paddingTop: 2 },
  reviewQText: { color: TEXT, fontSize: 12, lineHeight: 1.5 },
  reviewAns: { fontSize: 11, fontWeight: 600, borderRadius: 10, padding: "2px 10px", flexShrink: 0, whiteSpace: "nowrap" },

  // ── SUGGESTED MEASURES ───────────────────────────────────────
  suggestTitle: { color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 4 },
  suggestSub: { color: MUTED, fontSize: 11, marginBottom: 12 },
  suggestGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  suggestCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" },
  suggestCardCode: { display: "inline-block", color: WHITE, fontSize: 11, fontWeight: 800, borderRadius: 5, padding: "2px 8px", letterSpacing: "0.06em", flexShrink: 0 },
  suggestCardName: { color: TEXT, fontSize: 12, fontWeight: 700, lineHeight: 1.3 },
  suggestCardDesc: { color: MUTED, fontSize: 11, lineHeight: 1.5, margin: "0 0 10px" },
  suggestCardDivider: { height: 1, background: BORDER, marginBottom: 8 },
  suggestCardRow: { display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" },
  suggestCardRowLabel: { fontSize: 10, fontWeight: 700, minWidth: 110, flexShrink: 0, paddingTop: 1 },
  suggestCardRowVal: { color: TEXT, fontSize: 10, lineHeight: 1.4 },

  // ── OSM PANEL ────────────────────────────────────────────────
  osmPanel: { marginTop: 16, background: "#f0fbfb", border: "1px solid #b2e4e4", borderRadius: 8, padding: "14px 16px" },
  osmPanelTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  osmPanelTitle: { color: "#0a6060", fontSize: 12, fontWeight: 700, marginBottom: 2 },
  osmPanelSub: { color: MUTED, fontSize: 11, lineHeight: 1.4 },
  osmBtn: { background: "#0a9ea0", color: WHITE, border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", flexShrink: 0 },
  osmResult: { marginTop: 12, paddingTop: 12, borderTop: "1px solid #b2e4e4" },
  osmResultTitle: { color: "#0a6060", fontSize: 11, fontWeight: 600, marginBottom: 8 },
  osmResultGrid: { display: "flex", flexDirection: "column", gap: 5 },
  osmResultRow: { display: "flex", alignItems: "center", gap: 8 },
  osmResultLabel: { color: TEXT, fontSize: 11, flex: 1 },
  osmResultVal: { color: MUTED, fontSize: 11 },
  osmResultScore: { fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 7px" },
  osmAttrib: { color: MUTED, fontSize: 10, marginTop: 8, fontStyle: "italic" },
  osmBadge: { display: "inline-block", background: "#0a9ea0", color: WHITE, fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "1px 5px", marginLeft: 6, verticalAlign: "middle", letterSpacing: "0.04em" },

  // ── ONBOARDING ───────────────────────────────────────────────
  onboardOverlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,25,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" },
  onboardBox: { background: WHITE, borderRadius: 14, padding: "40px 48px", maxWidth: 980, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" },
  onboardHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` },
  onboardHeaderDiv: { width: 1, height: 22, background: BORDER },
  onboardHeaderSub: { color: MUTED, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 },
  onboardSub: { color: MUTED, fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" },
  onboardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 28 },
  onboardSectionTitle: { color: TEXT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` },
  onboardSection: { display: "flex", gap: 12, marginBottom: 16 },
  onboardNumBadge: { width: 22, height: 22, borderRadius: "50%", background: TEAL, color: WHITE, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  onboardSecLabel: { color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 3 },
  onboardSecDesc: { color: MUTED, fontSize: 12, lineHeight: 1.6 },
  onboardCard: { background: "#f9fafb", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", borderTop: `3px solid ${TEAL}` },
  onboardCardCode: { display: "inline-block", background: TEAL, color: WHITE, fontSize: 13, fontWeight: 800, borderRadius: 5, padding: "3px 10px", marginBottom: 6, letterSpacing: "0.06em" },
  onboardCardTitle: { color: TEXT, fontSize: 14, fontWeight: 700, marginBottom: 10 },
  onboardCardDivider: { height: 1, background: BORDER, marginBottom: 10 },
  onboardCardRow: { display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" },
  onboardCardRowLabel: { color: TEAL, fontSize: 11, fontWeight: 700, minWidth: 130, flexShrink: 0 },
  onboardCardRowDesc: { color: MUTED, fontSize: 11, lineHeight: 1.4 },
  onboardBtn: { width: "100%", background: TEAL, color: WHITE, border: "none", borderRadius: 8, padding: "13px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.03em" },

  // ── CONTEXT SECTION ──────────────────────────────────────────
  contextSection: { background: WHITE, borderTop: `1px solid ${BORDER}`, padding: "72px 40px" },
  contextInner: { maxWidth: 680, margin: "0 auto" },
  contextTag: { display: "inline-block", background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "4px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 },
  sectionTitle: { color: TEXT, fontSize: 20, fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.01em" },
  contextText: { color: MUTED, fontSize: 13, lineHeight: 1.8, margin: "0 0 24px" },
  contextLink: { color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${TEAL_MID}`, paddingBottom: 2 },

  // ── FEEDBACK SECTION ─────────────────────────────────────────
  feedbackSection: { background: BG, borderTop: `1px solid ${BORDER}`, padding: "72px 40px" },
  feedbackInner: { maxWidth: 600, margin: "0 auto" },
  feedbackSub: { color: MUTED, fontSize: 12, lineHeight: 1.7, margin: "0 0 28px" },
  feedbackForm: { display: "flex", flexDirection: "column", gap: 12 },
  feedbackRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  feedbackInput: { border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none", background: WHITE, fontFamily: "inherit" },
  feedbackTextarea: { border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none", background: WHITE, fontFamily: "inherit", resize: "vertical" },
  feedbackSuccess: { background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 8, padding: "14px 18px", color: TEAL, fontSize: 14, fontWeight: 500 },

  // ── FOOTER ───────────────────────────────────────────────────
  siteFooter: { background: TEAL, padding: "48px 40px" },
  footerInner: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  footerText: { color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0 },
  footerLink: { color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 2 },
};
