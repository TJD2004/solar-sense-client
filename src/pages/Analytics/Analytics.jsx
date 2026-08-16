import React, { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3, Sun, Home, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HISTORY_RANGES, buildHistory, mapHistoryResponse, summarizeHistory } from "../../services/history.js";
import { callOrFallback, getSolarHistory } from "../../services/api.js";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Analytics() {
  const { baselineSystem, initializing, connection } = useSimulation();
  const { t } = useLanguage();
  const [range, setRange] = useState("7d");
  const [points, setPoints] = useState(() => buildHistory("7d", baselineSystem.dailyKWh));
  const [source, setSource] = useState("simulated");
  const [loading, setLoading] = useState(false);

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
    return <div className="panel" aria-busy="true">Loading history…</div>;
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">
          <BarChart3 size={14} /> {t("analytics_title", "Performance Analytics & Insights")}
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-300)", margin: "0 0 16px", lineHeight: 1.5 }}>
          {t("analytics_subtitle", "Detailed breakdown of system efficiency, savings, and historical trends.")}
        </p>
        <div role="radiogroup" aria-label="Time range" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {HISTORY_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={range === r.id}
              onClick={() => setRange(r.id)}
              className="ss-chip"
              data-active={range === r.id || undefined}
            >
              {t(r.id, r.label)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        <SummaryTile icon={Sun} label={t("solar_generation", "Generated")} value={summary.generation} accent="#FF9933" />
        <SummaryTile icon={Home} label={t("home_consumption", "Consumed")} value={summary.consumption} accent="#5B9CE8" />
        <SummaryTile icon={ArrowUpRight} label={t("grid_export", "Exported")} value={summary.export} accent="#1FAE5C" />
        <SummaryTile icon={ArrowDownRight} label={t("grid_net", "Imported")} value={summary.import} accent="#FF7A1A" />
      </div>

      <div className="panel">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histGenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9933" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#FF9933" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="histConFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B9CE8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5B9CE8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1B2C45" vertical={false} />
              <XAxis dataKey="label" stroke="#728199" fontSize={11} tickLine={false} axisLine={false} interval={Math.ceil(points.length / 10) - 1} tickFormatter={(tick) => t(tick, tick)} />
              <YAxis stroke="#728199" fontSize={11} tickLine={false} axisLine={false} width={34} />
              <Tooltip contentStyle={{ background: "#0F2038", border: "1px solid #22344E", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#AFC0D6" }} labelFormatter={(label) => t(label, label)} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#728199" }} />
              <Area type="monotone" dataKey="generation" stroke="#FF9933" fill="url(#histGenFill)" strokeWidth={2} name={`${t("solar_generation", "Generation")} (kWh)`} />
              <Area type="monotone" dataKey="consumption" stroke="#5B9CE8" fill="url(#histConFill)" strokeWidth={2} name={`${t("home_consumption", "Consumption")} (kWh)`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}22`, color: accent, flexShrink: 0 }}>
        <Icon size={16} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 16 }}>{value} kWh</div>
        <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{label}</div>
      </div>
    </div>
  );
}
