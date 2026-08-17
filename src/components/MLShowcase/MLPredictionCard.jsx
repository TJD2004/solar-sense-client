import React, { useState, useEffect, useRef, useCallback } from "react";
import { Cpu, AlertTriangle, CheckCircle, Activity, RefreshCw } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { fetchMLPrediction } from "../../services/mlApi.js";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const HISTORY_LIMIT = 20;

export default function MLPredictionCard() {
  const { live, overrides } = useSimulation();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  const prevMLAnomalyRef = useRef(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const fetchPrediction = useCallback(async () => {
    if (!live) return;
    setLoading(true);
    const result = await fetchMLPrediction({
      temp: overrides?.temp ?? live.ambientTemp ?? live.panelTemp ?? 28,
      irradiance: overrides?.irradiance ?? live.irradiance ?? 800,
      cloudCoverage: overrides?.cloudCoverage ?? 15,
      humidity: overrides?.humidity ?? 50,
      windSpeed: overrides?.windSpeed ?? 10,
      capacityKW: overrides?.capacityKW ?? 5,
    });
    setLoading(false);

    if (result.available === false) return;

    setPrediction(result);

    // Push ML anomaly notification to Notification Center
    if (result.is_anomaly && !prevMLAnomalyRef.current) {
      addNotification(
        "critical",
        "ml_anomaly_alert_title",
        "🤖 ML Anomaly Alert — Generation Below Forecast",
        "ml_anomaly_alert_msg",
        "Actual: {actual} kW vs Predicted: {predicted} kW ({pct}% below forecast). Check panel health.",
        { actual: result.actual_solar_kw?.toFixed(2), predicted: result.predicted_solar_kw, pct: result.deviation_pct }
      );
      prevMLAnomalyRef.current = true;
    } else if (!result.is_anomaly) {
      prevMLAnomalyRef.current = false;
    }

    // Append to rolling history chart
    const now = new Date();
    const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: label,
          predicted: result.predicted_solar_kw,
          actual: result.actual_solar_kw ?? live?.solar ?? 0,
          confidenceMin: result.confidence_min,
          confidenceMax: result.confidence_max,
        },
      ];
      return next.slice(-HISTORY_LIMIT);
    });
  }, [live]);

  useEffect(() => {
    fetchPrediction();
    intervalRef.current = setInterval(fetchPrediction, 8000);
    return () => clearInterval(intervalRef.current);
  }, [fetchPrediction]);

  const deviation = prediction?.deviation_pct;
  const isAnomaly = prediction?.is_anomaly;

  const deviationColor =
    deviation === null || deviation === undefined
      ? "text-slate-400"
      : Math.abs(deviation) <= 10
      ? "text-emerald-600"
      : Math.abs(deviation) <= 20
      ? "text-amber-600"
      : "text-rose-600";

  return (
    <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.08)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Cpu className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              {t("ml_gen_forecast", "ML Yield Predictive Engine")}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("ml_model_details", "Random Forest Regressor • R² = 0.9928 • scikit-learn")}
            </p>
          </div>
        </div>

        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? t("btn_updating", "Updating…") : t("btn_refresh", "Refresh")}</span>
        </button>
      </div>

      {/* Dynamic Input Features row */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
        <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mr-1">{t("ml_inputs", "Inputs")}:</span>
        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono-num">
          ☀️ {overrides?.irradiance ?? live?.irradiance ?? 800} W/m²
        </span>
        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono-num">
          🌡️ {overrides?.temp ?? live?.panelTemp ?? 30}°C
        </span>
        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono-num">
          ☁️ {overrides?.cloudCoverage ?? 15}%
        </span>
        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono-num">
          💧 {overrides?.humidity ?? 50}%
        </span>
        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono-num">
          💨 {overrides?.windSpeed ?? 10} km/h
        </span>
      </div>

      {/* Main Metrics Row */}
      {prediction ? (
        <div className="grid grid-cols-3 gap-3">
          {/* Predicted */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
            <div className="text-[11px] font-semibold text-slate-500">{t("ml_predicted", "ML Predicted")}</div>
            <div className="text-xl font-extrabold text-emerald-600 font-mono-num">
              {prediction.predicted_solar_kw ?? "—"}
              <span className="text-xs font-sans font-semibold text-slate-500 ml-1">{t("kw_unit", "kW")}</span>
            </div>
            <div className="text-[10px] font-medium text-slate-400 font-mono-num">
              ±{((prediction.confidence_max - prediction.confidence_min) / 2).toFixed(2)} {t("kw_unit", "kW")}
            </div>
          </div>

          {/* Actual */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
            <div className="text-[11px] font-semibold text-slate-500">{t("actual_now", "Actual Telemetry")}</div>
            <div className="text-xl font-extrabold text-amber-600 font-mono-num">
              {prediction.actual_solar_kw?.toFixed(2) ?? live?.solar?.toFixed(2) ?? "—"}
              <span className="text-xs font-sans font-semibold text-slate-500 ml-1">{t("kw_unit", "kW")}</span>
            </div>
            <div className="text-[10px] font-medium text-slate-400">{t("live_telemetry_label", "Real-time feed")}</div>
          </div>

          {/* Deviation */}
          <div className={`border rounded-xl p-3 text-center space-y-1 ${isAnomaly ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"}`}>
            <div className="text-[11px] font-semibold text-slate-500">{t("deviation", "Yield Variance")}</div>
            <div className={`text-xl font-extrabold font-mono-num ${deviationColor}`}>
              {deviation !== null && deviation !== undefined ? `${deviation > 0 ? "+" : ""}${deviation}%` : "—"}
            </div>
            <div className="flex items-center justify-center gap-1">
              {isAnomaly ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span className="text-[10px] font-bold text-rose-600">{t("anomaly", "Anomaly")}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-600">{t("normal", "Optimal")}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-400 font-medium">
          {loading ? t("fetching_ml", "Running scikit-learn regression inference…") : t("ml_unavailable", "ML service standby — showing active twin heuristics.")}
        </div>
      )}

      {/* AI Anomaly Explanation */}
      {isAnomaly && prediction?.ai_explanation && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-rose-900 text-xs font-display">
              {t("ai_anomaly_analysis", "ML Anomaly Root Cause Analysis")}
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              {prediction.ai_explanation}
            </p>
          </div>
        </div>
      )}

      {/* Predicted vs Actual History Chart */}
      {history.length >= 2 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("expected_vs_actual", "Scikit-Learn Forecast vs Actual Telemetry")}</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mlPredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="mlActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={["auto", "auto"]} unit="kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  formatter={(v, name) => [`${v} kW`, name === "predicted" ? t("ml_predicted", "ML Predicted") : t("actual", "Actual")]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} fill="url(#mlPredGrad)" name="ML Forecast" dot={false} />
                <Area type="monotone" dataKey="actual" stroke="#F59E0B" strokeWidth={2} fill="url(#mlActualGrad)" name="Actual Telemetry" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

