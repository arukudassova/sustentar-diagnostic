import { TEAL, MUTED } from "../theme.js";

export default function QuizView({
  lang, t, cats, catIdx, setCatIdx, answers, answer,
  currentCat, osmResult, osmLoading, fetchOSMData,
  totalQ, answered, onReset, onFinish, s
}) {
  return (
    <div style={{ ...s.card, maxWidth: 760 }}>
      {/* TOP ROW: home left, progress right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <button style={{ ...s.btnOutline, padding: "4px 12px", fontSize: 12 }} onClick={onReset}>{lang === "es" ? "‹‹ Inicio" : "‹‹ Home"}</button>
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
        <span style={s.tabLabel}>{currentCat?.label}</span>
      </div>
      <div style={{ marginBottom: 24 }}>
        {/* OSM PANEL */}
        {(currentCat?.id === "movilidad_activa" || currentCat?.id === "transporte") && !osmResult && (
          <div style={{ ...s.osmPanel, marginBottom: 16 }}>
            <div style={s.osmPanelTop}>
              <div>
                <div style={s.osmPanelTitle}>{lang === "es" ? "Pre-completar desde OpenStreetMap" : "Pre-fill from OpenStreetMap"}</div>
                <div style={s.osmPanelSub}>{lang === "es" ? "Auto-completa preguntas de infraestructura con datos espaciales reales" : "Auto-fill infrastructure questions with real spatial data"}</div>
              </div>
              <button style={{ ...s.osmBtn, opacity: osmLoading ? 0.6 : 1, cursor: osmLoading ? "default" : "pointer" }} disabled={osmLoading} onClick={fetchOSMData}>
                {osmLoading ? (lang === "es" ? "Consultando..." : "Querying...") : (lang === "es" ? "Analizar ciudad" : "Analyse city")}
              </button>
            </div>
          </div>
        )}
        {osmResult && !osmResult.error && (
          <div style={{ ...s.osmPanel, marginBottom: 16 }}>
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
            <div style={s.osmAttrib}>{lang === "es" ? "Datos basados en OpenStreetMap · overpass-api.de" : "Data based on OpenStreetMap · overpass-api.de"}</div>
          </div>
        )}
        {currentCat?.questions.map((q, qi) => {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        {/* LEFT: Previous */}
        <button style={{ ...s.btnOutline, opacity: catIdx === 0 ? 0.3 : 1, width: "auto", padding: "10px 20px" }} disabled={catIdx === 0} onClick={() => setCatIdx((i) => i - 1)}>{t.prevBtn}</button>

        {/* RIGHT: Finalise (subtle) + Next/Submit (primary) */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{ ...s.btnSkip, marginTop: 0, width: "auto" }} onClick={onFinish}>{lang === "es" ? "Finalizar ››" : "Finalise ››"}</button>
          {catIdx < cats.length - 1
            ? <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 24px", opacity: 1, cursor: "pointer" }} onClick={() => {
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
            : <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 24px", opacity: 1, cursor: "pointer" }} onClick={() => {
                const unanswered = cats.reduce((sum, cat) => sum + cat.questions.filter(q => answers[q.id] === undefined).length, 0);
                if (unanswered > 0) {
                  const msg = lang === "es"
                    ? `Tenés ${unanswered} pregunta${unanswered > 1 ? "s" : ""} sin responder. ¿Ver resultados de todas formas?`
                    : `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. View results anyway?`;
                  if (window.confirm(msg)) onFinish();
                } else {
                  onFinish();
                }
              }}>{t.resultsBtn}</button>
          }
        </div>
      </div>
    </div>
  );
}
