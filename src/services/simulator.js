// Digital-twin simulator (spec §15). Produces a plausible daily generation
// curve plus a live "now" reading that drifts, and can inject one of the
// SCENARIOS fault patterns (cloudy / shading / soiling / inverter) so the
// AI Performance Detective and anomaly detector have something real to
// react to on demand, instead of waiting for an actual fault.
//
// Swap calls to this module for real /api/solar/* polling once the backend
// + real/simulated meter feed is wired up (see server/simulator/) — every
// export here returns the same shape the REST routes are documented to
// return in services/api.js, so pages don't need to change when that swap
// happens.

import { getScenario } from "./scenarios.js";

// Deterministic pseudo-random in [0,1), seeded by a number — keeps the same
// scenario producing the same curve on every render/tab switch instead of
// jittering, which would make the AI explanation look inconsistent.
function seeded(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function clearSkyValue(h) {
  const peak = 12.5;
  const spread = 3.4;
  const base = 5.1 * Math.exp(-Math.pow(h - peak, 2) / (2 * spread * spread));
  const noise = Math.sin(h * 3.1) * 0.15;
  return Math.max(0, base + noise);
}

function scenarioMultiplierAt(h, scenario) {
  if (!scenario.affectedHours && !scenario.gradual) {
    // normal day: tiny deterministic ripple so it doesn't look perfectly flat
    return 1 - seeded(h) * 0.04;
  }
  if (scenario.gradual) {
    const [minDrop, maxDrop] = scenario.dropRange;
    const progress = Math.min(1, Math.max(0, (h - 6) / 13));
    const drop = minDrop + (maxDrop - minDrop) * progress;
    return 1 - drop;
  }
  const [start, end] = scenario.affectedHours;
  if (h < start || h > end) return 1 - seeded(h) * 0.04;
  const [minDrop, maxDrop] = scenario.dropRange;
  if (scenario.cliff) {
    // sudden, sustained drop rather than a smooth dip — the anomaly-trigger case
    return h === start ? 1 - minDrop * 0.4 : 1 - maxDrop;
  }
  const wobble = seeded(h * 7.7);
  return 1 - (minDrop + (maxDrop - minDrop) * wobble);
}

export function buildTodayCurve(scenarioId = "normal", overrides = {}) {
  const scenario = getScenario(scenarioId);
  const points = [];

  let weatherMult = 1.0;
  if (overrides.weather === "cloudy") weatherMult = 0.40;
  if (overrides.weather === "rainy") weatherMult = 0.15;
  if (overrides.weather === "heatwave") weatherMult = 0.70;
  if (overrides.weather === "sunny") weatherMult = 1.0;

  const cloudMult = overrides.cloudCoverage !== undefined ? Math.max(0.05, 1 - (overrides.cloudCoverage / 100) * 0.90) : 1;
  const shadingMult = overrides.shading !== undefined ? Math.max(0.1, 1 - (overrides.shading / 100) * 0.85) : 1;
  const soilingMult = overrides.soiling !== undefined ? Math.max(0.3, 1 - (overrides.soiling / 100) * 0.65) : 1;
  const tempMult = overrides.temp !== undefined ? Math.max(0.35, 1 - Math.max(0, overrides.temp - 25) * 0.015) : 1;

  for (let h = 6; h <= 19; h++) {
    const expected = +clearSkyValue(h).toFixed(2);
    let multiplier = scenarioMultiplierAt(h, scenario);

    multiplier *= weatherMult * cloudMult * shadingMult * soilingMult * tempMult;

    if (overrides.irradiance !== undefined) {
      multiplier *= (overrides.irradiance / 1000);
    }

    const generation = +Math.max(0, expected * multiplier).toFixed(2);
    const consumption = overrides.homeLoad !== undefined 
      ? overrides.homeLoad 
      : +(1.6 + Math.sin((h - 6) / 2) * 0.5 + 0.4).toFixed(2);
    points.push({ hour: `${h}:00`, expected, generation, consumption });
  }
  return points;
}

export function nextLiveReading(prev, scenarioId = "normal", overrides = {}) {
  const now = new Date();
  const currentH = overrides.hour !== undefined ? overrides.hour : now.getHours();
  const currentM = overrides.hour !== undefined ? 0 : now.getMinutes();
  const currentS = overrides.hour !== undefined ? 0 : now.getSeconds();
  const hourFrac = currentH + currentM / 60 + currentS / 3600;

  const clearSkyNow = Math.max(0, clearSkyValue(hourFrac));

  let targetMult = 1.0;
  const h = Math.floor(hourFrac);

  switch (scenarioId) {
    case "cloudy":
      targetMult = 0.38;
      break;
    case "shading":
      targetMult = h >= 14 && h <= 17 ? 0.30 : 0.95;
      break;
    case "soiling": {
      const progress = Math.min(1, Math.max(0, (hourFrac - 6) / 13));
      targetMult = 1 - (0.12 + 0.28 * progress);
      break;
    }
    case "inverter":
      targetMult = h >= 12 ? 0.10 : 0.85;
      break;
    default:
      targetMult = 0.98;
  }

  let weatherFactor = 1.0;
  if (overrides.weather === "cloudy") weatherFactor = 0.40;
  if (overrides.weather === "rainy") weatherFactor = 0.15;
  if (overrides.weather === "heatwave") weatherFactor = 0.70;
  if (overrides.weather === "sunny") weatherFactor = 1.0;

  const cloudFactor = overrides.cloudCoverage !== undefined ? Math.max(0.05, 1 - (overrides.cloudCoverage / 100) * 0.90) : 1;
  const shadingFactor = overrides.shading !== undefined ? Math.max(0.1, 1 - (overrides.shading / 100) * 0.85) : 1;
  const soilingFactor = overrides.soiling !== undefined ? Math.max(0.3, 1 - (overrides.soiling / 100) * 0.65) : 1;
  const tempFactor = overrides.temp !== undefined ? Math.max(0.35, 1 - Math.max(0, overrides.temp - 25) * 0.015) : 1;

  const baseIrradiance = Math.max(0, Math.round((clearSkyNow / 5.1) * 1000 * cloudFactor * weatherFactor * shadingFactor));
  const irradiance = overrides.irradiance !== undefined ? overrides.irradiance : baseIrradiance;
  const irrFactor = irradiance / 1000;

  const target = clearSkyNow * targetMult * weatherFactor * cloudFactor * shadingFactor * soilingFactor * tempFactor * irrFactor;
  const solar = Math.max(0, +(target + (Math.random() - 0.5) * 0.05).toFixed(2));

  const home = overrides.homeLoad !== undefined ? overrides.homeLoad : 2.1;

  const surplus = solar - home;
  const battPower = +(Math.sign(surplus) * Math.min(2.5, Math.abs(surplus) * 0.75)).toFixed(2);
  const battery = overrides.batteryLevel !== undefined
    ? overrides.batteryLevel
    : +Math.min(100, Math.max(5, prev.battery + battPower * 0.15)).toFixed(0);

  const gridNet = +(surplus - battPower).toFixed(2);
  const grid = Math.max(0, +gridNet.toFixed(2));

  const ambientTemp = overrides.temp !== undefined ? overrides.temp : 30;
  const panelTemp = +(ambientTemp + (irradiance / 1000) * 25 + (Math.random() - 0.5) * 1.0).toFixed(1);
  const acVoltage = +(230 + (solar > 0 ? solar * 1.2 : -2.0) + (Math.random() - 0.5) * 2.0).toFixed(1);
  const acFrequency = +(50.0 + (Math.random() - 0.5) * 0.04).toFixed(2);
  const dcVoltage = solar > 0.05 ? +(310 + solar * 12).toFixed(1) : 0;
  const dcCurrent = solar > 0.05 && dcVoltage > 0 ? +(solar * 1000 / dcVoltage).toFixed(2) : 0;
  const powerFactor = +(0.985 + (Math.random() - 0.5) * 0.008).toFixed(3);
  const efficiency = +(98.0 * tempFactor * soilingFactor).toFixed(1);

  return {
    solar, home, grid, gridNet,
    battery, battPower,
    irradiance, panelTemp, ambientTemp,
    acVoltage, acFrequency, dcVoltage, dcCurrent,
    powerFactor, efficiency,
  };
}

export const INITIAL_LIVE_READING = {
  solar: 4.72, home: 2.1, battery: 76, grid: 2.62, gridNet: 2.62, battPower: 1.18,
  irradiance: 820, panelTemp: 59.2, ambientTemp: 33.5,
  acVoltage: 231.4, acFrequency: 50.01, dcVoltage: 367.2, dcCurrent: 12.84,
  powerFactor: 0.971, efficiency: 96.8,
};

// Finds the contiguous window (of length durationHours, snapped to the
// hourly curve) with the highest average solar surplus, so an appliance
// runs on sunshine instead of grid power. Heuristic placeholder for the
// real POST /api/ai/schedule route.
export function recommendWindow(curve, durationHours, powerKW) {
  const steps = Math.max(1, Math.round(durationHours));
  let best = null;
  for (let i = 0; i <= curve.length - steps; i++) {
    const slice = curve.slice(i, i + steps);
    const avgGen = slice.reduce((s, p) => s + p.generation, 0) / slice.length;
    const avgCon = slice.reduce((s, p) => s + p.consumption, 0) / slice.length;
    const surplus = avgGen - avgCon;
    if (!best || surplus > best.surplus) {
      best = { startHour: slice[0].hour, endIndex: i + steps, avgGen, surplus };
    }
  }
  const endHour = curve[Math.min(curve.length - 1, best.endIndex)]?.hour ?? best.startHour;
  const reductionKWh = Math.max(0, Math.min(powerKW, best.surplus)) * durationHours;
  return {
    window: `${best.startHour} – ${endHour}`,
    avgGen: +best.avgGen.toFixed(1),
    reductionKWh: +reductionKWh.toFixed(1),
  };
}

// Baseline system used by the What-If Simulator. capacityKW stays fixed
// (that's the installed hardware); dailyKWh now comes from whatever the
// live scenario is actually producing, via deriveDailyKWh(), so "Current"
// always matches what the rest of the app is showing.
export const BASELINE_SYSTEM = {
  capacityKW: 5,
  dailyKWh: 20,
};

export function deriveDailyKWh(curve) {
  // ~half-hour resolution would be more accurate; hourly sum is close enough
  // for a dashboard figure and keeps this cheap to recompute on every tick.
  return +curve.reduce((s, p) => s + p.generation, 0).toFixed(1);
}

export const WHAT_IF_TOGGLES = [
  { id: "panels", label: "Add 2 solar panels", capacityDelta: 2, dailyKWhDelta: 7 },
  { id: "battery", label: "Add a battery", capacityDelta: 0, dailyKWhDelta: 1.5 },
  { id: "ac", label: "Use AC for 6 hrs/day", capacityDelta: 0, dailyKWhDelta: -3.5 },
  { id: "ev", label: "Add an EV", capacityDelta: 0, dailyKWhDelta: -6 },
  { id: "consumption20", label: "Consumption +20%", capacityDelta: 0, dailyKWhDelta: -2.5 },
];

export function simulateWhatIf(activeIds, baseline) {
  const active = WHAT_IF_TOGGLES.filter((t) => activeIds.includes(t.id));
  const capacityKW = baseline.capacityKW + active.reduce((s, t) => s + t.capacityDelta, 0);
  const dailyKWh = Math.max(0, baseline.dailyKWh + active.reduce((s, t) => s + t.dailyKWhDelta, 0));
  return { capacityKW: +capacityKW.toFixed(1), dailyKWh: +dailyKWh.toFixed(1) };
}
