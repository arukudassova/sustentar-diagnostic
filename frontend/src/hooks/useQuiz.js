export default function useQuiz({ cats, MEASURES_DATA }) {
  function catPct(cat, answers) {
    const raw = cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return Math.round((raw / cat.maxScore) * 100);
  }

  function catRaw(cat, answers) {
    return cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  }

  function totalPct(answers) {
    const totalMax = cats.reduce((sum, c) => sum + c.maxScore, 0);
    const raw = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((raw / totalMax) * 100);
  }

  function getSuggestedMeasures(answers) {
    const lowCats = cats.filter(cat => catPct(cat, answers) < 50).map(c => c.id);
    const result = [];
    for (const grp of MEASURES_DATA) {
      const matches = grp.measures.filter(m => m.diagCats?.some(cat => lowCats.includes(cat)));
      if (matches.length === 0) continue;
      const limit = result.length === 0 ? 2 : 1;
      result.push(...matches.slice(0, limit));
      if (result.length >= 6) break;
    }
    return result.slice(0, 6);
  }

  return { catPct, catRaw, totalPct, getSuggestedMeasures };
}
