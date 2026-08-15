import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CloudSun, Sun, TrendingUp } from "lucide-react";
import { forecastNextHours, forecastTomorrowKWh, forecastWeek } from "../../services/forecast.js";
import { callOrFallback, getForecastToday, getForecastTomorrow, getForecastWeek } from "../../services/api.js";
import { EmptyState } from "../../components/common/AsyncState.jsx";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Forecast() {
  const { baselineSystem, initializing } = useSimulation();
  const { t } = useLanguage();
  const [nextHours, setNextHours] = useState(() => forecastNextHours());
  const [tomorrowKWh, setTomorrowKWh] = useState(() => forecastTomorrowKWh());
  const [week, setWeek] = useState(() => forecastWeek(baselineSystem.dailyKWh));

  useEffect(() => {
    let cancelled = false;
    callOrFallback(
      () => getForecastToday().then((r) => r.points),
      () => forecastNextHours()
    ).then((v) => !cancelled && setNextHours(v));
    callOrFallback(
      () => getForecastTomorrow().then((r) => r.expectedKWh),
      () => forecastTomorrowKWh()
    ).then((v) => !cancelled && setTomorrowKWh(v));
    callOrFallback(
      () => getForecastWeek().then((r) => r.points),
      () => forecastWeek(baselineSystem.dailyKWh)
    ).then((v) => !cancelled && setWeek(v));
    return () => {
      cancelled = true;
    };
  }, [baselineSystem.dailyKWh]);

  if (initializing) {
    return <div className="panel" aria-busy="true">Loading forecast…</div>;
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">
          <CloudSun size={14} /> {t("forecast_title", "Solar Production Forecast")}
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-300)", margin: 0, lineHeight: 1.5 }}>
          {t("forecast_subtitle", "AI-powered 7-day expected solar production forecast.")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-title">
            <Sun size={14} /> {t("today_curve_title", "Next Few Hours")}
          </div>
          {nextHours.length === 0 ? (
            <EmptyState title="No daylight hours left today" message="Check back after sunrise for tomorrow's hourly forecast." />
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nextHours} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1B2C45" vertical={false} />
                  <XAxis dataKey="hour" stroke="#728199" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#728199" fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ background: "#0F2038", border: "1px solid #22344E", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#AFC0D6" }} />
                  <Bar dataKey="expected" fill="#FF9933" radius={[4, 4, 0, 0]} name={`${t("expected_sky", "Predicted")} (kW)`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("tomorrow_forecast", "Tomorrow")}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 34, color: "var(--saffron)" }}>
            {tomorrowKWh}
            <span style={{ fontSize: 16, marginLeft: 4, color: "var(--ink-300)" }}>{t("kwh_unit", "kWh")}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>{t("expected_sky", "Expected generation, clear sky")}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <TrendingUp size={14} /> {t("weekly_forecast", "7-Day Expected Output")}
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1B2C45" vertical={false} />
              <XAxis dataKey="label" stroke="#728199" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#728199" fontSize={11} tickLine={false} axisLine={false} width={34} />
              <Tooltip contentStyle={{ background: "#0F2038", border: "1px solid #22344E", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#AFC0D6" }} />
              <Bar dataKey="expectedKWh" fill="#5B9CE8" radius={[4, 4, 0, 0]} name={`${t("expected_sky", "Expected")} (kWh)`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
