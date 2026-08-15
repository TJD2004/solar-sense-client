import { callOrFallback } from "./api.js";

const BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

/**
 * Fetch real-time ML solar generation prediction from the backend.
 * @param {object} features - optional feature overrides
 */
export async function fetchMLPrediction(features = {}) {
  try {
    const res = await fetch(`${BASE}/api/ml/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[mlApi] Prediction unavailable:", err.message);
    return { available: false };
  }
}

/**
 * Fetch ML model evaluation metrics (Hackathon Judges Showcase).
 */
export async function fetchMLMetrics() {
  try {
    const res = await fetch(`${BASE}/api/ml/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ...data, available: true };
  } catch (err) {
    console.warn("[mlApi] Metrics unavailable:", err.message);
    return { available: false };
  }
}

/**
 * Check ML microservice health.
 */
export async function fetchMLHealth() {
  try {
    const res = await fetch(`${BASE}/api/ml/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.available === true;
  } catch {
    return false;
  }
}
