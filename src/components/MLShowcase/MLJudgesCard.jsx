import React, { useState, useEffect } from "react";
import { Brain, Award, Database, BarChart2, CheckCircle } from "lucide-react";
import { fetchMLMetrics } from "../../services/mlApi.js";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FEATURE_COLORS = [
  "#1FA65C", "#EA580C", "#3B82F6", "#F59E0B",
  "#8B5CF6", "#06B6D4", "#EC4899", "#10B981"
];

export default function MLJudgesCard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const METRIC_LABELS = {
    mae: t("tbl_hdr_mae", "MAE (kW) ↓"),
    rmse: t("tbl_hdr_rmse", "RMSE (kW) ↓"),
    r2_score: t("tbl_hdr_r2", "R² Score ↑"),
  };

  const FEATURE_LABELS = {
    irradiance: t("irradiance", "Irradiance"),
    capacityKW: t("capacityKW_lbl", "Capacity (kW)"),
    temp: t("temp_lbl", "Temperature"),
    hour: t("hour_lbl", "Hour of Day"),
    month: t("month_lbl", "Month"),
    cloudCoverage: t("cloud_coverage_lbl", "Cloud Cover"),
    humidity: t("humidity_lbl", "Humidity"),
    windSpeed: t("wind_speed_lbl", "Wind Speed"),
  };

  useEffect(() => {
    fetchMLMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const featureData = metrics?.feature_importances
    ? Object.entries(metrics.feature_importances)
        .map(([key, val]) => ({
          name: FEATURE_LABELS[key] ?? key,
          importance: +(val * 100).toFixed(1),
        }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  return (
    <div
      className="panel"
      style={{
        background: "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(31,166,92,0.04) 100%)",
        border: "1.5px solid rgba(59,130,246,0.18)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(59,130,246,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={18} color="#3B82F6" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-100)" }}>
            {t("ml_model_performance", "ML Model Performance")}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-300)", marginTop: 1 }}>
            {t("ml_model_trained_on", "Trained with scikit-learn 1.9 on {samples} synthetic solar samples").replace("{samples}", metrics?.dataset?.total_samples?.toLocaleString() ?? "6,000")}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-300)", fontSize: 13 }}>
          {t("loading_ml_metrics", "Loading ML model metrics…")}
        </div>
      ) : !metrics?.available ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#EF4444", fontSize: 13 }}>
          {t("ml_service_offline", "ML service offline — start the FastAPI microservice to view metrics.")}
        </div>
      ) : (
        <>
          {/* Dataset Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {[
              { label: t("total_samples", "Total Samples"), value: metrics.dataset.total_samples?.toLocaleString(), icon: <Database size={12} /> },
              { label: t("train_set", "Train Set"), value: `${metrics.dataset.train_samples?.toLocaleString()} (80%)`, icon: <BarChart2 size={12} /> },
              { label: t("test_set", "Test Set"), value: `${metrics.dataset.test_samples?.toLocaleString()} (20%)`, icon: <BarChart2 size={12} /> },
              { label: t("features_lbl", "Features"), value: metrics.dataset.features?.length, icon: <Award size={12} /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  background: "rgba(59,130,246,0.07)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "#3B82F6", marginBottom: 4 }}>
                  {icon}
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-100)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Model Comparison Table */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-300)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              {t("model_comparison", "Model Comparison")}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--ink-300)", fontWeight: 600 }}>
                      {t("tbl_hdr_model", "Model")}
                    </th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--ink-300)", fontWeight: 600 }}>
                      {t("tbl_hdr_mae", "MAE (kW) ↓")}
                    </th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--ink-300)", fontWeight: 600 }}>
                      {t("tbl_hdr_rmse", "RMSE (kW) ↓")}
                    </th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--ink-300)", fontWeight: 600 }}>
                      {t("tbl_hdr_r2", "R² Score ↑")}
                    </th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--ink-300)", fontWeight: 600 }}>
                      {t("tbl_hdr_selected", "Selected")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(metrics.models).map((model) => (
                    <tr
                      key={model.name}
                      style={{
                        background: model.selected ? "rgba(31,166,92,0.06)" : "transparent",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <td style={{ padding: "8px 8px", fontWeight: model.selected ? 700 : 400, color: "var(--ink-100)" }}>
                        {model.name}
                        {model.selected && (
                          <span
                            style={{
                              marginLeft: 6,
                              background: "rgba(31,166,92,0.15)",
                              color: "var(--india-green)",
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "1px 5px",
                              borderRadius: 4,
                            }}
                          >
                            {t("winner_badge", "WINNER")}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 8px", color: model.selected ? "var(--india-green)" : "var(--ink-200)" }}>
                        {model.mae}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 8px", color: model.selected ? "var(--india-green)" : "var(--ink-200)" }}>
                        {model.rmse}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 8px", color: model.selected ? "var(--india-green)" : "var(--ink-200)", fontWeight: model.selected ? 700 : 400 }}>
                        {model.r2_score}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 8px" }}>
                        {model.selected ? <CheckCircle size={14} color="var(--india-green)" /> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importances Chart */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-300)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              {t("feature_importances_title", "Feature Importances (Random Forest)")}
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <XAxis type="number" unit="%" tick={{ fontSize: 9, fill: "var(--ink-400)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-300)" }} width={80} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Importance"]}
                    contentStyle={{
                      background: "var(--surface-glass)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="importance" radius={4}>
                    {featureData.map((_, i) => (
                      <Cell key={i} fill={FEATURE_COLORS[i % FEATURE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
