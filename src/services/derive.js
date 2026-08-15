// All money / environmental / health numbers shown in the app are derived
// from here so they can never disagree with each other or with the active
// scenario. Swap monthGeneratedKWh's source for a real DB aggregate
// (GET /api/analytics/savings) once the backend exists — the formulas below
// stay the same either side of that swap.

export const RATE_PER_KWH = 8; // ₹ avoided grid-purchase rate
export const EXPORT_RATE_PER_KWH = 3.5; // ₹ feed-in tariff for exported units
export const SELF_CONSUMPTION_RATIO = 0.55; // share of generation used on-site vs exported
export const CO2_FACTOR_KG_PER_KWH = 0.82; // approx. grid emission factor, India avg
export const KG_CO2_ABSORBED_PER_TREE_YEAR = 21; // rough mature-tree absorption/year

export function daysElapsedInMonth(date = new Date()) {
  return date.getDate();
}

export function deriveMonthlyImpact({ dailyKWh, date = new Date() }) {
  const days = daysElapsedInMonth(date);
  const monthGeneratedKWh = +(dailyKWh * days).toFixed(1);
  const selfConsumedKWh = monthGeneratedKWh * SELF_CONSUMPTION_RATIO;
  const exportedKWh = monthGeneratedKWh - selfConsumedKWh;
  const savings = Math.round(selfConsumedKWh * RATE_PER_KWH + exportedKWh * EXPORT_RATE_PER_KWH);
  const co2AvoidedKg = Math.round(monthGeneratedKWh * CO2_FACTOR_KG_PER_KWH);
  // Annualize this month's CO2-avoidance rate to express it as a tree equivalent.
  const annualizedCo2Kg = co2AvoidedKg * (365 / days);
  const treesPerYear = Math.max(1, Math.round(annualizedCo2Kg / KG_CO2_ABSORBED_PER_TREE_YEAR));

  return {
    monthGeneratedKWh,
    selfConsumedKWh: +selfConsumedKWh.toFixed(1),
    exportedKWh: +exportedKWh.toFixed(1),
    savings,
    co2AvoidedKg,
    treesPerYear,
  };
}

// Health score: 100 minus a penalty for how far today's actual generation
// trails the expected clear-sky curve, plus an extra penalty for sudden
// (cliff-like) drops since those matter more than a uniform, gradual dip.
export function deriveHealthScore(curve) {
  if (!curve?.length) return 100;
  const totalExpected = curve.reduce((s, p) => s + p.expected, 0);
  const totalActual = curve.reduce((s, p) => s + p.generation, 0);
  const shortfallRatio = totalExpected > 0 ? Math.max(0, 1 - totalActual / totalExpected) : 0;

  let maxSingleStepDrop = 0;
  for (let i = 1; i < curve.length; i++) {
    const prevRatio = curve[i - 1].expected > 0 ? curve[i - 1].generation / curve[i - 1].expected : 1;
    const currRatio = curve[i].expected > 0 ? curve[i].generation / curve[i].expected : 1;
    maxSingleStepDrop = Math.max(maxSingleStepDrop, prevRatio - currRatio);
  }

  const score = 100 - shortfallRatio * 60 - maxSingleStepDrop * 40;
  return Math.max(35, Math.min(100, Math.round(score)));
}
