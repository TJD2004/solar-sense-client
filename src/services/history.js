// Deterministic history generator (spec §4: Energy History). Real history
// should come from GET /api/solar/history?range= once the backend exists —
// this produces the same shape client-side so the Analytics page has
// something real to chart today, and swapping the source later is a
// one-line change (see services/api.js's callOrFallback).

import { BASELINE_SYSTEM } from "./simulator.js";

function seeded(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// One deterministic "day" of totals, varying around the baseline as if
// weather/consumption differed slightly day to day. dayIndex is days before
// today (0 = today).
function dayTotals(dayIndex, baseDailyKWh) {
  const wobble = seeded(dayIndex * 3.31) * 0.4 - 0.1; // -10%..+30%
  const isBadDay = seeded(dayIndex * 9.13) > 0.82; // occasional weather dip
  const multiplier = isBadDay ? 0.55 + seeded(dayIndex * 5.5) * 0.15 : 1 + wobble;
  const generation = +Math.max(2, baseDailyKWh * multiplier).toFixed(1);
  const consumption = +(baseDailyKWh * (0.55 + seeded(dayIndex * 4.2) * 0.2)).toFixed(1);
  const exportKWh = +Math.max(0, generation - consumption).toFixed(1);
  const importKWh = +Math.max(0, consumption - generation).toFixed(1);
  return { generation, consumption, export: exportKWh, import: importKWh };
}

export const HISTORY_RANGES = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "6m", label: "6 Months" },
  { id: "1y", label: "1 Year" },
];

export function buildHistory(rangeId, baseDailyKWh = BASELINE_SYSTEM.dailyKWh, now = new Date()) {
  if (rangeId === "7d" || rangeId === "30d") {
    const days = rangeId === "7d" ? 7 : 30;
    const points = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const totals = dayTotals(i, baseDailyKWh);
      points.push({
        label: days === 7 ? DAY_LABELS[d.getDay()] : `${d.getDate()}`,
        ...totals,
      });
    }
    return points;
  }

  // 6m / 1y: aggregate ~30 days into each monthly point
  const months = rangeId === "6m" ? 6 : 12;
  const points = [];
  for (let m = months - 1; m >= 0; m--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - m);
    let generation = 0;
    let consumption = 0;
    let exportKWh = 0;
    let importKWh = 0;
    for (let day = 0; day < 30; day++) {
      const seedIdx = m * 30 + day;
      const t = dayTotals(seedIdx, baseDailyKWh);
      generation += t.generation;
      consumption += t.consumption;
      exportKWh += t.export;
      importKWh += t.import;
    }
    points.push({
      label: MONTH_LABELS[d.getMonth()],
      generation: Math.round(generation),
      consumption: Math.round(consumption),
      export: Math.round(exportKWh),
      import: Math.round(importKWh),
    });
  }
  return points;
}

// Normalizes GET /api/solar/history's response — an array of daily
// aggregates shaped { _id: "YYYY-MM-DD", avgSolar, avgConsumption,
// totalExport, totalImport } — into the { label, generation, consumption,
// export, import } shape buildHistory() produces, so Analytics.jsx never
// has to know which source it's charting.
//
// avgSolar/avgConsumption are mean instantaneous kW, not daily kWh, so
// they're scaled by an approximate 6-peak-sun-hour factor to land in the
// same ballpark as the local generator's daily totals — an approximation,
// same as the local generator's synthetic wobble, not a metering claim.
const SUN_HOURS_APPROX = 6;

export function mapHistoryResponse(rangeId, backendPoints, now = new Date()) {
  const daily = backendPoints.map((p) => ({
    date: new Date(`${p._id}T00:00:00`),
    generation: +(p.avgSolar * SUN_HOURS_APPROX).toFixed(1),
    consumption: +(p.avgConsumption * SUN_HOURS_APPROX).toFixed(1),
    export: +p.totalExport.toFixed(1),
    import: +p.totalImport.toFixed(1),
  }));

  if (rangeId === "7d" || rangeId === "30d") {
    return daily.map((d) => ({
      label: rangeId === "7d" ? DAY_LABELS[d.date.getDay()] : `${d.date.getDate()}`,
      generation: d.generation,
      consumption: d.consumption,
      export: d.export,
      import: d.import,
    }));
  }

  // 6m / 1y: backend returns one point per day — aggregate into months so
  // the chart shows the same shape the local generator does for these
  // ranges instead of hundreds of daily bars.
  const byMonth = new Map();
  for (const d of daily) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    const entry = byMonth.get(key) || { label: MONTH_LABELS[d.date.getMonth()], generation: 0, consumption: 0, export: 0, import: 0, order: d.date.getFullYear() * 12 + d.date.getMonth() };
    entry.generation += d.generation;
    entry.consumption += d.consumption;
    entry.export += d.export;
    entry.import += d.import;
    byMonth.set(key, entry);
  }
  return [...byMonth.values()]
    .sort((a, b) => a.order - b.order)
    .map((e) => ({
      label: e.label,
      generation: Math.round(e.generation),
      consumption: Math.round(e.consumption),
      export: Math.round(e.export),
      import: Math.round(e.import),
    }));
}

export function summarizeHistory(points) {
  return points.reduce(
    (acc, p) => ({
      generation: +(acc.generation + p.generation).toFixed(1),
      consumption: +(acc.consumption + p.consumption).toFixed(1),
      export: +(acc.export + p.export).toFixed(1),
      import: +(acc.import + p.import).toFixed(1),
    }),
    { generation: 0, consumption: 0, export: 0, import: 0 }
  );
}
