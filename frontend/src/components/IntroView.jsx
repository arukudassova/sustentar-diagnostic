export default function IntroView({
  lang, t, cats, CITIES_DATA, MEASURES_DATA,
  cityName, setCityName, introTab, setIntroTab,
  selectedTile, setSelectedTile, onStart, s
}) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={s.card}>
        {/* STATS INSIDE BOX */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <span style={s.chip}>52 {lang === "es" ? "preguntas" : "questions"}</span>
          <span style={s.chip}>6 {lang === "es" ? "dimensiones" : "dimensions"}</span>
          <span style={s.chip}>~10 min</span>
        </div>

        <p style={s.desc}>{t.introDesc}</p>

        {/* TABS */}
        <div style={s.introTabBar}>
          {[
            { id: "tool", es: "Sobre la herramienta", en: "About the tool" },
            { id: "measures", es: "Glosario", en: "Glossary" },
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
              disabled={!cityName.trim()} onClick={onStart}>
              {t.startBtn}
            </button>
          </div>
        )}

        {/* TAB: PMUS MEASURES */}
        {introTab === "measures" && (
          <div style={s.introTabContent}>
            <p style={{ ...s.desc, marginBottom: 16 }}>{lang === "es" ? "Las 33 medidas de la Guía PMUS organizadas en 7 grupos temáticos. Haz clic en cualquier medida para ver su descripción." : "The 33 SUMP Guide measures in 7 thematic groups. Click any measure to see its description."}</p>
            {MEASURES_DATA.map(g => (
              <div key={g.group} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                {/* LEFT: group badge */}
                <div style={{ width: 64, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: g.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>
                    {g.group}
                  </div>
                  <div style={{ fontSize: 10, color: g.color, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
                    {typeof g.label === "object" ? g.label[lang] : g.label}
                  </div>
                </div>
                {/* RIGHT: measures list */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  {g.measures.map(m => (
                    <button key={m.code}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: selectedTile?.code === m.code ? g.bg : "transparent",
                        border: "none", borderBottom: `1px solid ${g.color}22`,
                        padding: "5px 4px", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      }}
                      onClick={() => setSelectedTile(selectedTile?.code === m.code ? null : { ...m, groupColor: g.color, groupBg: g.bg, groupLight: g.light })}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: g.color, background: g.bg, border: `1px solid ${g.color}66`, borderRadius: 4, padding: "2px 6px", minWidth: 28, textAlign: "center" }}>{m.code}</span>
                      <span style={{ fontSize: 12, color: "#2d2926" }}>{m.name[lang]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
