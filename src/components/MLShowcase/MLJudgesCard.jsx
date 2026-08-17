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
  "#10B981", "#F59E0B", "#0EA5E9", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#64748B"
];

export default function MLJudgesCard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="bg-white border border-sky-200/80 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.08)] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
          <Brain className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm font-display">
            {t("ml_model_performance", "Scikit-Learn Model Benchmark")}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t("ml_model_trained_on", "Trained on {samples} solar telemetry samples").replace("{samples}", metrics?.dataset?.total_samples?.toLocaleString() ?? "6,000")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-slate-400 font-medium">
          {t("loading_ml_metrics", "Loading model telemetry benchmark…")}
        </div>
      ) : !metrics?.available ? (
        <div className="text-center py-6 text-xs text-rose-500 font-medium">
          {t("ml_service_offline", "ML service standby — active fallback metrics loaded.")}
        </div>
      ) : (
        <>
          {/* Dataset Info Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: t("total_samples", "Samples"), value: metrics?.dataset?.total_samples?.toLocaleString() ?? "N/A", icon: <Database className="w-3 h-3" /> },
              { label: t("train_set", "Train"), value: metrics?.dataset?.train_samples?.toLocaleString() ?? "N/A", icon: <BarChart2 className="w-3 h-3" /> },
              { label: t("test_set", "Test"), value: metrics?.dataset?.test_samples?.toLocaleString() ?? "N/A", icon: <BarChart2 className="w-3 h-3" /> },
              { label: t("features_lbl", "Features"), value: metrics?.dataset?.features?.length ?? 0, icon: <Award className="w-3 h-3" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-sky-600 text-[10px] font-bold uppercase tracking-wider">
                  {icon}
                  <span>{label}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 font-mono-num">{value}</div>
              </div>
            ))}
          </div>

          {/* Model Comparison Table */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">
              {t("model_comparison", "Algorithm Benchmarking Matrix")}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-left">
                    <th className="pb-2 font-medium">{t("tbl_hdr_model", "Model")}</th>
                    <th className="pb-2 text-center font-medium">{t("tbl_hdr_mae", "MAE (kW) ↓")}</th>
                    <th className="pb-2 text-center font-medium">{t("tbl_hdr_rmse", "RMSE (kW) ↓")}</th>
                    <th className="pb-2 text-center font-medium">{t("tbl_hdr_r2", "R² Score ↑")}</th>
                    <th className="pb-2 text-center font-medium">{t("tbl_hdr_selected", "Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-num">
                  {Object.values(metrics?.models || {}).map((model) => (
                    <tr key={model.name} className={model?.selected ? "bg-emerald-50/50 font-bold" : "text-slate-600"}>
                      <td className="py-2 font-sans font-semibold text-slate-900 flex items-center gap-2">
                        <span>{model.name}</span>
                        {model.selected && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider font-mono-num">
                            WINNER
                          </span>
                        )}
                      </td>
                      <td className={`py-2 text-center ${model.selected ? "text-emerald-700 font-bold" : ""}`}>{model.mae}</td>
                      <td className={`py-2 text-center ${model.selected ? "text-emerald-700 font-bold" : ""}`}>{model.rmse}</td>
                      <td className={`py-2 text-center ${model.selected ? "text-emerald-700 font-bold" : ""}`}>{model.r2_score}</td>
                      <td className="py-2 text-center">
                        {model.selected ? <CheckCircle className="w-4 h-4 text-emerald-600 inline-block" /> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importances Chart */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">
              {t("feature_importances_title", "Random Forest Feature Weight Distribution")}
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <XAxis type="number" unit="%" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} width={85} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Weight"]}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
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

