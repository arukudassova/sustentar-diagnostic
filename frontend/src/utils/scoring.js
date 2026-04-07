import { UI } from "../theme.js";

export function getRiskLevel(pct, lang) {
  const t = UI[lang];
  if (pct >= 75) return { label: t.riskLow, color: "#1a7a4a", bg: "#dcf5e7", dot: "#22c55e" };
  if (pct >= 50) return { label: t.riskMod, color: "#8a6200", bg: "#fef3c7", dot: "#f59e0b" };
  if (pct >= 25) return { label: t.riskHigh, color: "#9a3a00", bg: "#ffedd5", dot: "#f97316" };
  return { label: t.riskCrit, color: "#9a1a1a", bg: "#fee2e2", dot: "#ef4444" };
}
