// Score computation for each KPI, category averages, and overall classification.

window.computeAll = function(state) {
  // state: { meta: {...}, kpiVals: { [kpiId]: { [subsetId]: { [inputId]: value } } } }
  const ctx = { areaType: state.meta?.areaType || "urban" };
  const result = {
    kpis: [],            // [{ id, name, category, subsets:[{id,name,score,weight}], score }]
    catAAvg: 0,
    catBAvg: 0,
    zone: null,
  };

  const catScores = { A: [], B: [] };

  for (const kpi of window.KPI_CONFIG) {
    const kpiVals = (state.kpiVals && state.kpiVals[kpi.id]) || {};
    const subsetResults = [];
    let weightedSum = 0;

    for (const sub of kpi.subsets) {
      const v = {};
      // Pull values, parse numbers when possible
      for (const inp of sub.inputs) {
        const raw = kpiVals[sub.id]?.[inp.id];
        if (raw === undefined || raw === null || raw === "") {
          v[inp.id] = (typeof inp.default === "number") ? inp.default : (inp.default ?? 0);
        } else if (inp.options) {
          v[inp.id] = String(raw); // categorical kept as string
        } else {
          const n = Number(raw);
          v[inp.id] = isFinite(n) ? n : 0;
        }
      }
      let score = 0;
      try {
        score = sub.compute(v, ctx, sub);
      } catch (e) {
        console.warn(`compute err KPI-${kpi.id} ${sub.id}`, e);
        score = 0;
      }
      score = Math.max(0, Math.min(100, +score || 0));
      subsetResults.push({ id: sub.id, name: sub.name, score: +score.toFixed(2), weight: sub.weight });
      weightedSum += score * sub.weight;
    }

    let kpiScore = Math.min(100, weightedSum);
    // Custom override (e.g. KPI-2's "if A=100 → 100")
    if (kpi.customScore) {
      const override = kpi.customScore(
        Object.fromEntries(subsetResults.map(s => [s.id, s])),
        kpiVals
      );
      if (override !== null && override !== undefined) kpiScore = override;
    }
    kpiScore = +Math.max(0, Math.min(100, kpiScore)).toFixed(2);

    result.kpis.push({
      id: kpi.id, name: kpi.name, category: kpi.category, subcat: kpi.subcat || "",
      subsets: subsetResults, score: kpiScore,
    });
    catScores[kpi.category].push(kpiScore);
  }

  const avg = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2) : 0;
  result.catAAvg = avg(catScores.A);
  result.catBAvg = avg(catScores.B);
  result.zone = window.classifyZone(result.catBAvg, result.catAAvg);
  return result;
};
