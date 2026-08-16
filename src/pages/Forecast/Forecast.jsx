import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CloudSun, Sun, TrendingUp, Compass, Wind, Droplets, Thermometer, Eye } from "lucide-react";
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
    return <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-soft">Loading forecast…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CloudSun className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">Solar Yield Forecast & Weather Intelligence</h1>
            <p className="text-xs text-slate-500 font-medium">Predictive machine learning models synchronized with meteorological forecasts.</p>
          </div>
        </div>
      </div>

      {/* Split View: Weather Mapping & Tomorrow Forecast Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weather Mapping & Solar Irradiance Widget */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wide uppercase font-display">
              <Compass className="w-4 h-4 text-sky-500 stroke-[2.5]" />
              <span>Meteorological Map & Irradiance Field</span>
            </div>
            <span className="text-xs font-mono-num font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              100% CLEAR SKY
            </span>
          </div>

          {/* Interactive Micro Weather Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Irradiance</span>
              </div>
              <div className="text-lg font-bold font-mono-num text-slate-900">895 <span className="text-xs font-sans text-slate-500">W/m²</span></div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Panel Temp</span>
              </div>
              <div className="text-lg font-bold font-mono-num text-slate-900">32.4 <span className="text-xs font-sans text-slate-500">°C</span></div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Wind className="w-4 h-4 text-sky-500" />
                <span>Wind Speed</span>
              </div>
              <div className="text-lg font-bold font-mono-num text-slate-900">14.2 <span className="text-xs font-sans text-slate-500">km/h</span></div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>Humidity</span>
              </div>
              <div className="text-lg font-bold font-mono-num text-slate-900">42 <span className="text-xs font-sans text-slate-500">%</span></div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 mt-2">
            <Eye className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-900 font-medium">
              High solar irradiance expected continuously for the next 48 hours. Optimum angle alignment detected.
            </p>
          </div>
        </div>

        {/* Tomorrow Predicted Yield Tile */}
        <div className="lg:col-span-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 shadow-soft text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs uppercase font-bold tracking-widest text-amber-100 mb-2 font-mono-num">
            {t("tomorrow_forecast", "Tomorrow Yield Prediction")}
          </div>
          <div className="text-5xl font-extrabold font-mono-num tracking-tight my-2">
            {tomorrowKWh}
          </div>
          <div className="text-sm font-semibold text-amber-100 font-mono-num mb-4">kWh Total Production</div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/30">
            ☀️ {t("expected_sky", "Expected clear-sky generation")}
          </div>
        </div>
      </div>

      {/* Next Hours Hourly Bar Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-wide uppercase font-display">
            <Sun className="w-4 h-4 text-amber-500 stroke-[2.5]" />
            <span>Intraday Hourly Production Trend</span>
          </div>
        </div>

        {nextHours.length === 0 ? (
          <EmptyState title="No daylight hours left today" message="Check back after sunrise for tomorrow's hourly forecast." />
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nextHours} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} className="font-mono-num" />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={35} className="font-mono-num" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                <Bar dataKey="expected" fill="#F59E0B" radius={[6, 6, 0, 0]} name={`${t("expected_sky", "Predicted Yield")} (kW)`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 7-Day Expected Output */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-wide uppercase font-display">
            <TrendingUp className="w-4 h-4 text-sky-500 stroke-[2.5]" />
            <span>{t("weekly_forecast", "7-Day Expected Output Horizon")}</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(tick) => t(tick, tick)}
                className="font-mono-num"
              />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={38} className="font-mono-num" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono, monospace",
                }}
                labelFormatter={(lbl) => t(lbl, lbl)}
              />
              <Bar dataKey="expectedKWh" fill="#0EA5E9" radius={[6, 6, 0, 0]} name={`${t("expected_sky", "Expected")} (kWh)`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

