import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import html2pdf from "html2pdf.js";
import useApiData from "./hooks/useApiData.js";
import s from "./styles/appStyles.js";
import useQuiz from "./hooks/useQuiz.js";
import ResultsView from "./components/ResultsView.jsx";
import IntroView from "./components/IntroView.jsx";
import RoleView from "./components/RoleView.jsx";
import CitySizeView from "./components/CitySizeView.jsx";
import QuizView from "./components/QuizView.jsx";

// Load Lato from Google Fonts
if (typeof document !== "undefined" && !document.getElementById("sustentar-fonts")) {
  const link = document.createElement("link");
  link.id = "sustentar-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;900&display=swap";
  document.head.appendChild(link);
}


import { API_URL, LOGO_URL, TEAL, TEAL_LIGHT, TEAL_MID, ACCENT, BORDER, UI } from "./theme.js";
import Header, { LangToggle } from "./components/Header.jsx";

export default function App() {
  console.log("FRONTEND APP RUNNING");

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
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // API data state
  const { apiCities, apiQuestions, apiMeasures, apiLoading, apiError } = useApiData(lang);

  function downloadReport() {
    const element = document.getElementById("report");

    if (!element) return; // safety

    html2pdf().set({
      margin: 10,
      filename: `mobility-report-${cityName || "city"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(element).save();
  }

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

    setAnswers(newAnswers);
    setOsmResult({ filledCount: fields.length, fields, city: base, isDemo: true });
    setOsmLoading(false);
    setStep("quiz");
  }

  const t = UI[lang];
  const cats = CATEGORIES_DATA;
  const { catPct, catRaw, totalPct, getSuggestedMeasures } = useQuiz({ cats, MEASURES_DATA });
  const totalQ = cats.flatMap((c) => c.questions).length;
  const answered = Object.keys(answers).length;
  const currentCat = cats[catIdx];
  const catDone = currentCat?.questions.every((q) => answers[q.id] !== undefined);

  function answer(qId, score) { setAnswers((p) => ({ ...p, [qId]: score })); }

  function submitFeedback() {
    if (!fbMessage.trim()) return;
    supabase.from("feedback").insert({
      city: fbCity, name: fbName, message: fbMessage
    }).then(() => {}).catch(() => {});
    setFbSubmitted(true);
  }

    function reset() { setStep("intro"); setAnswers({}); setCatIdx(0); setCityName(""); setSelectedTile(null); setUserRole(null); setCitySize(null); setFbSubmitted(false); }

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
      btn: "Entendido, comenzar ››",
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
      btn: "Got it, start ››",
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
              <div style={{ marginLeft: "auto" }}><LangToggle lang={lang} setLang={setLang} s={s} /></div>
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
      <Header
        lang={lang} setLang={setLang}
        scrolled={scrolled} isQuizActive={isQuizActive}
        cityName={cityName} onReset={reset}
        onHelp={() => setShowOnboarding(true)} s={s}
      />

      {/* HERO — intro only */}
      {step === "intro" && (
        <section style={{
          ...s.heroSection,

          minHeight: "90vh",   // 🔥 bigger hero
          height: "90vh",

          marginTop: "-80px",
          paddingTop: "80px",

          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",

          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* DARK OVERLAY */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35))"
        }} />

        {/* CONTENT */}
          <div style={{
            ...s.heroInner,
            position: "relative",
            zIndex: 1,
            transform: `translateY(${offset * 0.15}px)`,
            transition: "transform 0.1s linear"
          }}>
          <div style={{
            ...s.heroBadge,
            color: "#fff",
            borderColor: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.1)"
          }}>
            {lang === "es"
              ? "Guía PMUS Argentina"
              : "PMUS Argentina Guide"}
          </div>

          <h1 style={{
            ...s.heroTitle,
            color: "#fff"
          }}>
            {lang === "es"
              ? "Evaluación de Movilidad Sostenible Municipal"
              : "Municipal Sustainable Mobility Assessment"}
          </h1>
        </div>

      </section>
      )}

      {/* TOOL SECTION */}
      <section id="herramienta" style={s.toolSection}>

        {/* INTRO */}
        {step === "intro" && (
          <IntroView
            lang={lang} t={t} cats={cats}
            CITIES_DATA={CITIES_DATA} MEASURES_DATA={MEASURES_DATA}
            cityName={cityName} setCityName={setCityName}
            introTab={introTab} setIntroTab={setIntroTab}
            selectedTile={selectedTile} setSelectedTile={setSelectedTile}
            onStart={() => setStep("role")} s={s}
          />
        )}


        {/* ROLE SELECTION */}
        {step === "role" && (
          <RoleView
            lang={lang} userRole={userRole} setUserRole={setUserRole}
            onBack={() => setStep("intro")} onNext={() => setStep("citysize")} s={s}
          />
        )}

        {/* CITY SIZE SELECTION */}
        {step === "citysize" && (
          <CitySizeView
            lang={lang} citySize={citySize} setCitySize={setCitySize}
            onBack={() => setStep("role")} onNext={() => setStep("quiz")} s={s}
          />
        )}

        {/* QUIZ */}
        {step === "quiz" && (
          <QuizView
            lang={lang} t={t} cats={cats}
            catIdx={catIdx} setCatIdx={setCatIdx}
            answers={answers} answer={answer}
            currentCat={currentCat}
            osmResult={osmResult} osmLoading={osmLoading} fetchOSMData={fetchOSMData}
            totalQ={totalQ} answered={answered}
            onReset={reset} onFinish={() => setStep("review")} s={s}
          />
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
              <button style={s.btnOutline} onClick={() => { setCatIdx(0); setStep("quiz"); }}>{lang === "es" ? "‹‹ Volver al cuestionario" : "‹‹ Back to questionnaire"}</button>
              <button style={s.btnPrimary} onClick={() => setStep("results")}>{lang === "es" ? "Confirmar y ver resultados ››" : "Confirm & view results ››"}</button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <ResultsView
            lang={lang} t={t}
            apiLoading={apiLoading} MEASURES_DATA={MEASURES_DATA}
            answers={answers} cats={cats}
            cityName={cityName} osmResult={osmResult}
            expandedCats={expandedCats} setExpandedCats={setExpandedCats}
            catPct={catPct} catRaw={catRaw}
            totalPct={totalPct} getSuggestedMeasures={getSuggestedMeasures}
            onEdit={() => { setAnswers({}); setCatIdx(0); setStep("quiz"); }}
            onDownload={downloadReport}
            onReset={reset}
            s={s}
          />
        )}

      </section>

      {/* CONTEXT SECTION */}
      <section style={s.contextSection}>
      <div style={{
        ...s.contextInner,
        display: "flex",
        gap: 32,
        alignItems: "center"
      }}>

        {/* LEFT TEXT */}
        <div style={{ flex: 1 }}>
          <div style={s.contextTag}>
            {lang === "es" ? "Sobre la herramienta" : "About the tool"}
          </div>

          <h2 style={s.sectionTitle}>
            {lang === "es"
              ? "Basado en la Guía PMUS Argentina"
              : "Based on the PMUS Argentina Guide"}
          </h2>

          <p style={s.contextText}>
            {lang === "es"
              ? "Esta herramienta digitaliza el autodiagnóstico del Plan de Movilidad Urbana Sostenible (PMUS) desarrollado por Asociación Sustentar junto al Ministerio de Transporte de la Nación en 2023. Permite a municipios y autoridades de transporte evaluar su situación actual, identificar brechas y priorizar intervenciones de manera estructurada."
              : "This tool digitises the self-assessment of the Sustainable Urban Mobility Plan (SUMP) developed by Asociación Sustentar together with Argentina's Ministry of Transport in 2023. It allows municipalities and transport authorities to assess their current situation, identify gaps and prioritise interventions in a structured way."}
          </p>

          <a
            href="https://datos.transporte.gob.ar/dataset/dd391c9d-8aeb-4508-a04d-feee67362608/resource/a461e4a5-26de-453e-b9dc-e64c616ad926/download/guia_para_la_planificacion_de_la_movilidad_urbana_sosostenible.pdf"
            target="_blank"
            rel="noreferrer"
            style={s.contextLink}
          >
            {lang === "es" ? "Ver guía completa ››" : "View full guide ››"}
          </a>
        </div>

        {/* RIGHT IMAGE */}
        <img
          src="/pmus-cover.jpg"
          alt="PMUS Argentina Guide"
          style={{
            width: 160,
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            cursor: "pointer"
          }}
          onClick={() =>
            window.open("https://datos.transporte.gob.ar/dataset/dd391c9d-8aeb-4508-a04d-feee67362608/resource/a461e4a5-26de-453e-b9dc-e64c616ad926/download/guia_para_la_planificacion_de_la_movilidad_urbana_sosostenible.pdf")
          }
        />
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