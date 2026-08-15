import React from "react";
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function GenerationChart({ data }) {
  const { t } = useLanguage();

  return (
    <div className="panel">
      <div className="panel-title">
        <TrendingUp size={14} /> {t("today_curve_title", "Today's Solar Generation Curve")}
      </div>
      <div style={{ height: 200, marginTop: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="genFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9933" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FF9933" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="conFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B9CE8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#5B9CE8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B2C45" vertical={false} />
            <XAxis dataKey="hour" stroke="#728199" fontSize={11} tickLine={false} axisLine={false} interval={2} />
            <YAxis stroke="#728199" fontSize={11} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: "#0F2038", border: "1px solid #22344E", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "#AFC0D6" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#728199" }} />
            {data?.[0]?.expected !== undefined && (
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#728199"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                dot={false}
                name={`${t("expected_sky", "Expected")} (kW)`}
              />
            )}
            <Area type="monotone" dataKey="generation" stroke="#FF9933" fill="url(#genFill)" strokeWidth={2} name={`${t("solar_generation", "Generation")} (kW)`} />
            <Area type="monotone" dataKey="consumption" stroke="#5B9CE8" fill="url(#conFill)" strokeWidth={2} name={`${t("home_consumption", "Consumption")} (kW)`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
