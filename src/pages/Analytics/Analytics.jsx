import React, { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3, Sun, Home, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { HISTORY_RANGES, buildHistory, mapHistoryResponse, summarizeHistory } from "../../services/history.js";
import { callOrFallback, getSolarHistory } from "../../services/api.js";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Analytics() {
  const { baselineSystem, initializing } = useSimulation();
  const { t } = useLanguage();
  const [range, setRange] = useState("7d");
  const [points, setPoints] = useState(() => buildHistory("7d", baselineSystem.dailyKWh));
  const [, setSource] = useState("simulated");
  const [, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    callOrFallback(
      async () => {
        const res = await getSolarHistory(range);
        return { points: mapHistoryResponse(range, res.points), source: res.source === "db" ? "meter history" : "simulated" };
      },
      () => ({ points: buildHistory(range, baselineSystem.dailyKWh), source: "simulated" })
    ).then((result) => {
      if (cancelled) return;
      setPoints(result.points);
      setSource(result.source);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [range, baselineSystem.dailyKWh]);

  const summary = useMemo(() => summarizeHistory(points), [points]);

  if (initializing) {
    return <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-soft">Loading history…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-lg font-display">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2>{t("analytics_title", "Performance Analytics & Multi-Axis Insights")}</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t("analytics_subtitle", "Detailed breakdown of system efficiency, savings, and historical generation trends.")}
            </p>
          </div>

          {/* Range Chips */}
          <div role="radiogroup" aria-label="Time range" className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            {HISTORY_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={range === r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === r.id
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {t(r.id, r.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile icon={Sun} label={t("solar_generation", "Total Generation")} value={summary.generation} accent="#F59E0B" />
        <SummaryTile icon={Home} label={t("home_consumption", "Total Consumption")} value={summary.consumption} accent="#0EA5E9" />
        <SummaryTile icon={ArrowUpRight} label={t("grid_export", "Grid Net Export")} value={summary.export} accent="#10B981" />
        <SummaryTile icon={ArrowDownRight} label={t("grid_net", "Grid Net Import")} value={summary.import} accent="#8B5CF6" />
      </div>

      {/* Wide Container Multi-Axis Graph */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-wide uppercase font-display">
            <Activity className="w-4 h-4 text-sky-500" />
            <span>Yield & Consumption Multi-Axis Curve</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="histGenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="histConFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={Math.ceil(points.length / 10) - 1}
                tickFormatter={(tick) => t(tick, tick)}
                className="font-mono-num"
              />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={40} className="font-mono-num" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#0F172A",
                }}
                labelFormatter={(lbl) => t(lbl, lbl)}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px", fontFamily: "Plus Jakarta Sans, sans-serif" }} />
              <Area
                type="monotone"
                dataKey="generation"
                stroke="#F59E0B"
                fill="url(#histGenFill)"
                strokeWidth={2.5}
                name={`${t("solar_generation", "Generation")} (kWh)`}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stroke="#0EA5E9"
                fill="url(#histConFill)"
                strokeWidth={2.5}
                name={`${t("home_consumption", "Consumption")} (kWh)`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex items-center gap-3.5">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        <Icon className="w-5 h-5 stroke-[2.2]" />
      </div>
      <div>
        <div className="text-xl font-bold font-mono-num text-slate-900">{value} <span className="text-xs text-slate-500 font-sans font-semibold">kWh</span></div>
        <div className="text-xs font-medium text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

