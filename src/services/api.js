import axios from "axios";

// Base client for the SolarSense backend (see /server). In dev, Vite proxies
// /api to http://localhost:4000 (see vite.config.js), so a relative baseURL
// is enough. When the client and server are deployed to different origins
// (e.g. client on Vercel, server on Render — see render.yaml/vercel.json),
// set VITE_API_BASE_URL to the deployed server's origin and requests go
// there directly instead, relying on the server's CORS_ORIGIN allowlist.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "https://solar-sense-backend-8rsi.onrender.com");
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 8000,
});

// Set VITE_USE_BACKEND=true once the Express server exists and pages should
// call the real routes instead of the local digital-twin simulator. Until
// then every page reads from SimulationContext (services/simulator.js), so
// flipping this flag is the only change needed to cut over — no page code
// has to move off `useSimulation()`.
export const USE_BACKEND = import.meta.env?.VITE_USE_BACKEND === "true";

// Wraps a real API call with a fallback so a page can be wired to the
// backend early without breaking the demo if that route isn't up yet —
// tries the network call, and falls back (with a console warning, not a
// thrown error) if it fails or USE_BACKEND is off.
export async function callOrFallback(apiCall, fallback) {
  if (!USE_BACKEND) return fallback();
  try {
    return await apiCall();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("SolarSense API call failed, using simulated data:", err?.message);
    return fallback();
  }
}

// --- Solar ---
export const getLiveSolar = () => api.get("/solar/live").then((r) => r.data);
export const getTodaySolar = () => api.get("/solar/today").then((r) => r.data);
export const getSolarHistory = (range = "7d") => api.get(`/solar/history?range=${range}`).then((r) => r.data);

// --- AI ---
export const analyzePerformance = (payload) => api.post("/ai/analyze", payload).then((r) => r.data);
export const chatWithCopilot = (message) => api.post("/ai/chat", { message }).then((r) => r.data);
export const getScheduleRecommendation = (appliance) => api.post("/ai/schedule", appliance).then((r) => r.data);

// --- Forecast ---
export const getForecastToday = () => api.get("/forecast/today").then((r) => r.data);
export const getForecastTomorrow = () => api.get("/forecast/tomorrow").then((r) => r.data);
export const getForecastWeek = () => api.get("/forecast/week").then((r) => r.data);

// --- Simulator (Digital Twin) ---
export const getSimulatorStatus = () => api.get("/simulator/status").then((r) => r.data);
export const setSimulatorScenario = (scenarioId) =>
  api.post("/simulator/scenario", { scenarioId }).then((r) => r.data);
export const setSimulatorOffline = (offline) =>
  api.post("/simulator/scenario", { offline }).then((r) => r.data);

export default api;
