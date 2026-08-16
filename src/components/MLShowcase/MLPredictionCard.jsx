import React, { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Cpu, AlertTriangle, CheckCircle, Activity, RefreshCw } from "lucide-react";
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
  ReferenceLine,
  Legend,
} from "recharts";

const HISTORY_LIMIT = 20;

export default function MLPredictionCard() {
  const { live } = useSimulation();
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
      temp: live.panelTemp ?? live.ambientTemp ?? 28,
      irradiance: live.irradiance ?? 800,
      cloudCoverage: 15,
      humidity: 50,
      windSpeed: 10,
      capacityKW: 5,
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
      ? "var(--ink-300)"
      : Math.abs(deviation) <= 10
      ? "var(--india-green)"
      : Math.abs(deviation) <= 20
      ? "#F59E0B"
      : "#EF4444";

  return (
    <div
      className="panel"
      style={{
        background: "linear-gradient(135deg, var(--surface-glass) 0%, rgba(31,166,92,0.04) 100%)",
        border: "1.5px solid rgba(31,166,92,0.18)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(31,166,92,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cpu size={18} color="var(--india-green)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-100)", letterSpacing: "-0.3px" }}>
              {t("ml_gen_forecast", "ML Generation Forecast")}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-300)", marginTop: 1 }}>
              {t("ml_model_details", "Random Forest • R² = 0.9928 • scikit-learn")}
            </div>
          </div>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          style={{
            background: "transparent",
            border: "1px solid rgba(31,166,92,0.3)",
            borderRadius: 8,
            cursor: "pointer",
            padding: "5px 8px",
            color: "var(--india-green)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
          }}
          title={t("btn_refresh", "Refresh")}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? t("btn_updating", "Updating…") : t("btn_refresh", "Refresh")}
        </button>
      </div>

      {/* Main Metrics Row */}
      {prediction ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {/* Predicted */}
          <div
            style={{
              background: "rgba(31,166,92,0.08)",
              borderRadius: 10,
              padding: "12px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--ink-300)", marginBottom: 4 }}>{t("ml_predicted", "ML Predicted")}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--india-green)", letterSpacing: "-0.5px" }}>
              {prediction.predicted_solar_kw ?? "—"}
              <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 2 }}>{t("kw_unit", "kW")}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-300)", marginTop: 2 }}>
              ±{((prediction.confidence_max - prediction.confidence_min) / 2).toFixed(2)} {t("kw_unit", "kW")}
            </div>
          </div>

          {/* Actual */}
          <div
            style={{
              background: "rgba(234,88,12,0.08)",
              borderRadius: 10,
              padding: "12px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--ink-300)", marginBottom: 4 }}>{t("actual_now", "Actual Now")}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--india-saffron)", letterSpacing: "-0.5px" }}>
              {prediction.actual_solar_kw?.toFixed(2) ?? live?.solar?.toFixed(2) ?? "—"}
              <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 2 }}>{t("kw_unit", "kW")}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-300)", marginTop: 2 }}>{t("live_telemetry_label", "Live telemetry")}</div>
          </div>

          {/* Deviation */}
          <div
            style={{
              background: isAnomaly ? "rgba(239,68,68,0.08)" : "rgba(31,166,92,0.04)",
              borderRadius: 10,
              padding: "12px 14px",
              textAlign: "center",
              border: isAnomaly ? "1px solid rgba(239,68,68,0.3)" : "none",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--ink-300)", marginBottom: 4 }}>{t("deviation", "Deviation")}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: deviationColor, letterSpacing: "-0.5px" }}>
              {deviation !== null && deviation !== undefined ? `${deviation > 0 ? "+" : ""}${deviation}%` : "—"}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 2 }}>
              {isAnomaly ? (
                <>
                  <AlertTriangle size={10} color="#EF4444" />
                  <span style={{ fontSize: 10, color: "#EF4444" }}>{t("anomaly", "Anomaly")}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={10} color="var(--india-green)" />
                  <span style={{ fontSize: 10, color: "var(--india-green)" }}>{t("normal", "Normal")}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-300)", fontSize: 13 }}>
          {loading ? t("fetching_ml", "Fetching ML prediction…") : t("ml_unavailable", "ML service unavailable — ensure ml_service is running.")}
        </div>
      )}

      {/* AI Anomaly Explanation */}
      {isAnomaly && prediction?.ai_explanation && (
        <div
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#EF4444", marginBottom: 3 }}>
              {t("ai_anomaly_analysis", "AI Anomaly Analysis")}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-200)", lineHeight: 1.55 }}>
              {prediction.ai_explanation}
            </div>
          </div>
        </div>
      )}

      {/* Predicted vs Actual History Chart */}
      {history.length >= 2 && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink-300)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Activity size={11} />
            {t("expected_vs_actual", "Expected vs Actual Generation")}
          </div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="mlPredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1FA65C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1FA65C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mlActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--ink-400)" }} />
                <YAxis tick={{ fontSize: 9, fill: "var(--ink-400)" }} domain={["auto", "auto"]} unit="kW" />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-glass)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(v, name) => [`${v} kW`, name === "predicted" ? t("ml_predicted", "ML Predicted") : t("actual", "Actual")]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#1FA65C"
                  strokeWidth={1.5}
                  fill="url(#mlPredGrad)"
                  name={t("ml_predicted", "Predicted")}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#EA580C"
                  strokeWidth={1.5}
                  fill="url(#mlActualGrad)"
                  name={t("actual", "Actual")}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
