// Forecast generator (spec §7). Reuses the same clear-sky curve as
// services/simulator.js so "expected" numbers agree everywhere in the app.
// Real forecasts should come from GET /api/forecast/* once the backend and
// a weather feed exist — this is the client-side stand-in with the same
// shape, per services/api.js's callOrFallback pattern.

import { buildTodayCurve } from "./simulator.js";

function seeded(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Remaining daylight hours today, using the same expected clear-sky curve
// the Dashboard chart already shows (not the fault-scenario-adjusted one —
// a forecast is inherently "what we expect", not "what's currently wrong").
export function forecastNextHours(now = new Date()) {
  const curve = buildTodayCurve("normal");
  const currentHour = now.getHours();
  return curve.filter((p) => parseInt(p.hour, 10) >= currentHour).map((p) => ({ hour: p.hour, expected: p.expected }));
}

export function forecastTomorrowKWh() {
  const curve = buildTodayCurve("normal");
  return +curve.reduce((s, p) => s + p.expected, 0).toFixed(1);
}

export function forecastWeek(baseDailyKWh, now = new Date()) {
  const points = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const wobble = seeded(i * 6.7) * 0.35 - 0.05; // -5%..+30% day-to-day weather variance
    const expectedKWh = +Math.max(3, baseDailyKWh * (1 + wobble)).toFixed(1);
    points.push({ label: DAY_LABELS[d.getDay()], expectedKWh });
  }
  return points;
}
