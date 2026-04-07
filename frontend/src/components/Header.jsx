import { LOGO_URL } from "../theme.js";

export function LangToggle({ lang, setLang, s }) {
  return (
    <div style={s.langToggle}>
      <button style={{ ...s.langBtn, ...(lang === "es" ? s.langBtnActive : {}) }} onClick={() => setLang("es")}>ES</button>
      <button style={{ ...s.langBtn, ...(lang === "en" ? s.langBtnActive : {}) }} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

export default function Header({ lang, setLang, scrolled, isQuizActive, cityName, onReset, onHelp, s }) {
  return (
    <header style={{
      ...s.stickyHeader,
      height: scrolled ? 60 : 90,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      transition: "all 0.3s ease",
      background: scrolled
        ? "#ffffff"
        : "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.15))",
      color: scrolled ? "#000" : "#fff",
      boxShadow: scrolled ? "0 4px 16px rgba(0,0,0,0.08)" : "none"
    }}>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <img
          src={LOGO_URL}
          alt="Sustentar"
          style={{
            height: scrolled ? 22 : 32,
            filter: scrolled ? "none" : "brightness(0) invert(1)",
            transition: "all 0.3s ease"
          }}
          onClick={onReset}
        />

        {isQuizActive && cityName && (
          <span style={s.navCityBadge}>{cityName}</span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {isQuizActive && (
            <button style={s.navRestartBtn} onClick={onReset}>
              {lang === "es" ? "‹‹ Inicio" : "‹‹ Home"}
            </button>
          )}
          <button style={s.helpBtn} onClick={onHelp}>?</button>
          <LangToggle lang={lang} setLang={setLang} s={s} />
        </div>
      </div>
    </header>
  );
}
