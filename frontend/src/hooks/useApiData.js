import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

export default function useApiData(lang) {
  const [apiCities, setApiCities] = useState(null);
  const [apiQuestions, setApiQuestions] = useState(null);
  const [apiMeasures, setApiMeasures] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

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

  return { apiCities, apiQuestions, apiMeasures, apiLoading, apiError };
}
