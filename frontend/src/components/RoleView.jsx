export default function RoleView({ lang, userRole, setUserRole, onBack, onNext, s }) {
  return (
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
        <button style={s.btnOutline} onClick={onBack}>{lang === "es" ? "‹‹ Volver" : "‹‹ Back"}</button>
        <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 28px", opacity: userRole ? 1 : 0.4, cursor: userRole ? "pointer" : "default" }} disabled={!userRole} onClick={onNext}>
          {lang === "es" ? "Siguiente ››" : "Next ››"}
        </button>
      </div>
    </div>
  );
}
