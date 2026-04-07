import { getRiskLevel } from "../utils/scoring.js";
import { MUTED, TEXT } from "../theme.js";
import RadialScore from "./RadialScore.jsx";

export default function ResultsView({
  lang, t, apiLoading, MEASURES_DATA, answers, cats,
  cityName, osmResult, expandedCats, setExpandedCats,
  catPct, catRaw, totalPct, getSuggestedMeasures,
  onEdit, onDownload, onReset, s
}) {
  if (apiLoading || MEASURES_DATA.length === 0) {
    return <div style={{ padding: 40, color: MUTED, fontSize: 13 }}>{lang === "es" ? "Cargando resultados..." : "Loading results..."}</div>;
  }

  const total = totalPct(answers);
  const risk = getRiskLevel(total, lang);
  const fieldLabel = {
    tipos: { es: "Tipo de intervención", en: "Intervention type" },
    horizonte: { es: "Horizonte", en: "Timeline" },
    costo: { es: "Costo económico", en: "Economic cost" },
    ambito: { es: "Ámbito de aplicación", en: "Area of application" },
    ecm: { es: "Enfoque ECM", en: "ECM framework" },
  };

  return (
    <>
      <div id="report" style={{ ...s.card, maxWidth: 900 }}>
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
            const pct = catPct(cat, answers);
            const raw = catRaw(cat, answers);
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
          const suggested = getSuggestedMeasures(answers).slice(0, 6);
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
      </div>

      {/* BUTTONS OUTSIDE */}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={s.btnOutline} onClick={onEdit}>{t.editBtn}</button>
        <button style={s.btnOutline} onClick={onDownload}>{t.downloadBtn}</button>
        <button style={s.btnPrimary} onClick={onReset}>{t.newBtn}</button>
      </div>
    </>
  );
}
