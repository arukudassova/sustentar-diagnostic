import { ScrollText, ClipboardList, Bike, Bus, Cpu, ShieldCheck } from "lucide-react";
import { TEAL, TEAL_LIGHT, MUTED, BORDER, TEXT } from "../theme.js";

const CAT_ICONS = {
  normativa: ScrollText,
  planificacion: ClipboardList,
  movilidad_activa: Bike,
  transporte: Bus,
  tecnologia: Cpu,
  seguridad_vial: ShieldCheck,
  seguridad: ShieldCheck,
  road_safety: ShieldCheck,
  vial: ShieldCheck,
};

function getCatIcon(id) {
  if (CAT_ICONS[id]) return CAT_ICONS[id];
  if (id?.includes("segur") || id?.includes("vial") || id?.includes("safety")) return ShieldCheck;
  if (id?.includes("norm") || id?.includes("reg")) return ScrollText;
  if (id?.includes("plan")) return ClipboardList;
  if (id?.includes("activ") || id?.includes("bike") || id?.includes("cicl")) return Bike;
  if (id?.includes("trans") || id?.includes("bus")) return Bus;
  if (id?.includes("tecn") || id?.includes("tech")) return Cpu;
  return null;
}

export default function QuizView({
  lang, t, cats, catIdx, setCatIdx, answers, answer,
  currentCat, osmResult, osmLoading, fetchOSMData,
  totalQ, answered, onReset, onFinish, s
}) {
  return (
    <div style={{ ...s.card, maxWidth: 860 }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button style={{ ...s.btnOutline, padding: "4px 12px", fontSize: 12, width: "auto" }} onClick={onReset}>{lang === "es" ? "‹‹ Inicio" : "‹‹ Home"}</button>
        <span style={{ color: MUTED, fontSize: 12 }}>{t.progressLabel(answered, totalQ)}</span>
      </div>

      {/* PROGRESS BAR */}
      <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${(answered / totalQ) * 100}%` }} /></div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>

        {/* LEFT: section nav */}
        <div style={{ width: 160, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {cats.map((c, i) => {
            const done = c.questions.every((q) => answers[q.id] !== undefined);
            const active = i === catIdx;
            const Icon = getCatIcon(c.id);
              return (
              <button key={c.id} onClick={() => setCatIdx(i)} style={{
                background: active ? TEAL : done ? TEAL_LIGHT : "#f0f4f3",
                color: active ? "#fff" : done ? TEAL : MUTED,
                border: `1px solid ${active ? TEAL : done ? TEAL : BORDER}`,
                borderRadius: 8, padding: "8px 12px",
                fontSize: 12, fontWeight: active ? 700 : 500,
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8
              }}>
                {Icon && <Icon size={14} strokeWidth={1.75} color={active ? "#fff" : done ? TEAL : MUTED} />}
                <span style={{ flex: 1 }}>{c.label}</span>
                {done && <span style={{ fontSize: 10 }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* RIGHT: questions */}
        <div style={{ flex: 1 }}>
          {/* Section heading */}
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 14 }}>{currentCat?.label}</div>

          {/* OSM PANEL */}
          {(currentCat?.id === "movilidad_activa" || currentCat?.id === "transporte") && !osmResult && (
            <div style={{ ...s.osmPanel, marginBottom: 12 }}>
              <div style={s.osmPanelTop}>
                <div>
                  <div style={s.osmPanelTitle}>{lang === "es" ? "Pre-completar desde OpenStreetMap" : "Pre-fill from OpenStreetMap"}</div>
                  <div style={s.osmPanelSub}>{lang === "es" ? "Auto-completa preguntas con datos espaciales reales" : "Auto-fill questions with real spatial data"}</div>
                </div>
                <button style={{ ...s.osmBtn, opacity: osmLoading ? 0.6 : 1, cursor: osmLoading ? "default" : "pointer" }} disabled={osmLoading} onClick={fetchOSMData}>
                  {osmLoading ? (lang === "es" ? "Consultando..." : "Querying...") : (lang === "es" ? "Analizar ciudad" : "Analyse city")}
                </button>
              </div>
            </div>
          )}
          {(currentCat?.id === "movilidad_activa" || currentCat?.id === "transporte") && osmResult?.error && (
            <div style={{ ...s.osmPanel, marginBottom: 12, borderColor: "#f5c0c0", background: "#fff5f5" }}>
              <div style={{ fontSize: 13, color: "#9a1a1a", marginBottom: 8 }}>{osmResult.errorMsg}</div>
              <button style={{ ...s.osmBtn, background: "#e55", fontSize: 12 }} onClick={fetchOSMData}>
                {lang === "es" ? "Reintentar" : "Retry"}
              </button>
            </div>
          )}
          {osmResult && !osmResult.error && (
            <div style={{ ...s.osmPanel, marginBottom: 12 }}>
              <div style={s.osmResultTitle}>{lang === "es" ? `✓ ${osmResult.filledCount} respuestas pre-completadas desde OpenStreetMap` : `✓ ${osmResult.filledCount} answers pre-filled from OpenStreetMap`}</div>
              <div style={s.osmResultGrid}>
                {osmResult.fields.map(f => (
                  <div key={f.id} style={s.osmResultRow}>
                    <span style={s.osmResultLabel}>{f.label}</span>
                    <span style={s.osmResultVal}>{f.value} {f.unit}</span>
                    <span style={{ ...s.osmResultScore, background: f.score === 3 ? "#dcf5e7" : f.score === 2 ? "#fef3c7" : "#fee2e2", color: f.score === 3 ? "#1a7a4a" : f.score === 2 ? "#8a6200" : "#9a1a1a" }}>{f.score} pts</span>
                  </div>
                ))}
              </div>
              <div style={s.osmAttrib}>{lang === "es" ? "Datos basados en OpenStreetMap" : "Data based on OpenStreetMap"}</div>
            </div>
          )}

          {/* QUESTIONS */}
          {currentCat?.questions.map((q, qi) => {
            const osmFilled = osmResult && !osmResult.error && osmResult.fields.some(f => f.id === q.id);
            return (
              <div key={q.id} style={s.qBlock}>
                <p style={s.qText}>
                  <span style={s.qNum}>{qi + 1}.</span> {q.text}
                  {osmFilled && <span style={s.osmBadge}>OSM</span>}
                </p>
                {/* HORIZONTAL ANSWER BUTTONS — sorted Yes first (desc score) */}
                <div style={{ display: "flex", gap: 8 }}>
                  {[...q.options].sort((a, b) => b.score - a.score).map((opt) => {
                    const sel = answers[q.id] !== undefined && answers[q.id] === opt.score;
                    return (
                      <button key={opt.label}
                        style={{ ...s.opt, ...(sel ? s.optSel : {}), ...(sel && osmFilled ? { borderColor: "#0a9ea0", background: "#f0fbfb", color: "#0a7a7a" } : {}) }}
                        onClick={() => answer(q.id, opt.score)}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* BOTTOM NAV */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <button style={{ ...s.btnOutline, opacity: catIdx === 0 ? 0.3 : 1, width: "auto", padding: "8px 20px" }} disabled={catIdx === 0} onClick={() => setCatIdx((i) => i - 1)}>{t.prevBtn}</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...s.btnSkip, marginTop: 0, width: "auto" }} onClick={onFinish}>{lang === "es" ? "Finalizar ››" : "Finalise ››"}</button>
              {catIdx < cats.length - 1
                ? <button style={{ ...s.btnPrimary, width: "auto", padding: "8px 24px" }} onClick={() => {
                    const unanswered = currentCat.questions.filter(q => answers[q.id] === undefined).length;
                    if (unanswered > 0) {
                      const msg = lang === "es"
                        ? `Tenés ${unanswered} pregunta${unanswered > 1 ? "s" : ""} sin responder. ¿Continuar?`
                        : `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Continue?`;
                      if (window.confirm(msg)) setCatIdx((i) => i + 1);
                    } else { setCatIdx((i) => i + 1); }
                  }}>{t.nextBtn}</button>
                : <button style={{ ...s.btnPrimary, width: "auto", padding: "8px 24px" }} onClick={() => {
                    const unanswered = cats.reduce((sum, cat) => sum + cat.questions.filter(q => answers[q.id] === undefined).length, 0);
                    if (unanswered > 0) {
                      const msg = lang === "es"
                        ? `Tenés ${unanswered} pregunta${unanswered > 1 ? "s" : ""} sin responder. ¿Ver resultados?`
                        : `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. View results?`;
                      if (window.confirm(msg)) onFinish();
                    } else { onFinish(); }
                  }}>{t.resultsBtn}</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
