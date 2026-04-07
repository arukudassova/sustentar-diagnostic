import { Building, MapPin, Home } from "lucide-react";
import { TEAL, MUTED } from "../theme.js";

const ICONS = { grande: Building, intermedia: MapPin, pequena: Home };

export default function CitySizeView({ lang, citySize, setCitySize, onBack, onNext, s }) {
  return (
    <div style={{ ...s.card, maxWidth: 560 }}>
      <div style={s.stepProgress}>{lang === "es" ? "Paso 2 de 2" : "Step 2 of 2"}</div>
      <h2 style={s.h2}>{lang === "es" ? "¿Cuál es el tamaño de la ciudad?" : "What is the size of the city?"}</h2>
      <p style={{ ...s.desc, marginBottom: 24 }}>{lang === "es" ? "Esto adapta los umbrales de evaluación según la Guía PMUS." : "This adapts the assessment thresholds according to the SUMP Guide."}</p>
      <div style={s.roleGrid}>
        {[
          { id: "grande", es: "Gran aglomerado", en: "Large agglomeration", sub: { es: "Más de 500.000 habitantes", en: "More than 500,000 inhabitants" } },
          { id: "intermedia", es: "Ciudad intermedia", en: "Mid-size city", sub: { es: "Entre 50.000 y 500.000 habitantes", en: "Between 50,000 and 500,000 inhabitants" } },
          { id: "pequena", es: "Localidad pequeña", en: "Small town", sub: { es: "Menos de 50.000 habitantes", en: "Less than 50,000 inhabitants" } },
        ].map(r => {
          const Icon = ICONS[r.id];
          const active = citySize === r.id;
          return (
            <button key={r.id}
              style={{ ...s.roleCard, ...(active ? s.roleCardActive : {}), display: "flex", alignItems: "flex-start", gap: 14 }}
              onClick={() => setCitySize(r.id)}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <Icon size={20} color={active ? TEAL : MUTED} strokeWidth={1.75} />
              </div>
              <div>
                <div style={s.roleCardTitle}>{r[lang]}</div>
                <div style={s.roleCardSub}>{r.sub[lang]}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button style={s.btnOutline} onClick={onBack}>{lang === "es" ? "‹‹ Volver" : "‹‹ Back"}</button>
        <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 28px", opacity: citySize ? 1 : 0.4, cursor: citySize ? "pointer" : "default" }} disabled={!citySize} onClick={onNext}>
          {lang === "es" ? "Iniciar diagnóstico ››" : "Start assessment ››"}
        </button>
      </div>
    </div>
  );
}
