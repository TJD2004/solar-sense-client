import React from "react";
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function GenerationChart({ data }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wide uppercase font-display">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>{t("today_curve_title", "Solar Generation vs. Load Profile")}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono-num text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Generation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Consumption</span>
          </span>
        </div>
      </div>

      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="genFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="conFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={2}
              className="font-mono-num"
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={35}
              className="font-mono-num"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                color: "#0F172A",
                fontSize: "12px",
                fontFamily: "JetBrains Mono, monospace",
              }}
              labelStyle={{ fontWeight: "700", color: "#0F172A" }}
            />
            {data?.[0]?.expected !== undefined && (
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#94A3B8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                name={`${t("expected_sky", "Expected Yield")} (kW)`}
              />
            )}
            <Area
              type="monotone"
              dataKey="generation"
              stroke="#F59E0B"
              fill="url(#genFillGrad)"
              strokeWidth={2.5}
              name={`${t("solar_generation", "Generation")} (kW)`}
            />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#0EA5E9"
              fill="url(#conFillGrad)"
              strokeWidth={2.5}
              name={`${t("home_consumption", "Consumption")} (kW)`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

