import React from "react";
import { WifiOff, Wifi, History, Sliders } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function formatTime(d) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export default function ScenarioControl() {
  const { scenarios, scenarioId, setScenario, offline, toggleOffline, anomalyActive, eventLog } = useSimulation();
  const { t } = useLanguage();

  const SCENARIO_LABELS = {
    normal: t("scenario_normal", "Normal Clear Sky"),
    cloudy: t("scenario_cloudy", "Passing Clouds"),
    shading: t("scenario_shading", "Afternoon Shading"),
    soiling: t("scenario_soiling", "Panel Dust & Soiling"),
    inverter: t("scenario_inverter", "Inverter Hardware Fault"),
    rainy: t("scenario_rainy", "Heavy Monsoon Rain"),
    heatwave: t("scenario_heatwave", "Extreme Heatwave"),
  };

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4 transition-colors ${
      anomalyActive ? "border-rose-200 bg-rose-50/20" : "border-slate-100"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wide uppercase font-display">
          <Sliders className="w-4 h-4 text-amber-500 stroke-[2.5]" />
          <span>{t("scenario_title", "Digital Twin — Inject Condition & Fault Scenario")}</span>
        </div>

        <button
          type="button"
          onClick={toggleOffline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all self-start sm:self-auto ${
            offline
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          {offline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{offline ? t("meter_offline", "Meter Offline") : t("simulate_drop", "Simulate Connection Drop")}</span>
        </button>
      </div>

      <div role="radiogroup" aria-label="Simulated condition" className="flex items-center gap-2 flex-wrap">
        {scenarios.map((s) => {
          const isActive = s.id === scenarioId;
          const displayLabel = SCENARIO_LABELS[s.id] || s.label;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setScenario(s.id)}
              title={s.description}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600"
              }`}

            >
              <span>{s.emoji}</span>
              <span>{displayLabel}</span>
            </button>
          );
        })}
      </div>

      {eventLog.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("event_log_title", "Digital Twin Event Log")}</span>
          </div>
          <ul className="space-y-1 text-xs font-mono-num max-h-24 overflow-y-auto pr-1">
            {eventLog.map((e) => {
              let msgStr = e.message;
              if (msgStr.includes("Production anomaly detected")) msgStr = t("anomaly_detected_msg", "Production anomaly detected");
              else if (msgStr.includes("Meter connection dropped")) msgStr = t("meter_dropped_msg", "Meter connection dropped");
              else if (msgStr.includes("Meter back online")) msgStr = t("meter_online_msg", "Meter back online");
              else if (msgStr.includes("Live feed unavailable")) msgStr = t("feed_unavailable_msg", "Live feed unavailable — showing local simulation");
              else if (msgStr.includes("Live connection lost")) msgStr = t("connection_lost_msg", "Live connection lost — reconnecting…");
              else if (msgStr.includes("triggered")) {
                const parts = msgStr.split(" triggered");
                const rawName = parts[0];
                let labelKey = "scenario_normal";
                if (rawName.includes("Cloudy")) labelKey = "scenario_cloudy";
                else if (rawName.includes("Shading")) labelKey = "scenario_shading";
                else if (rawName.includes("Dust") || rawName.includes("Soiling")) labelKey = "scenario_soiling";
                else if (rawName.includes("Inverter")) labelKey = "scenario_inverter";
                else if (rawName.includes("Rain")) labelKey = "scenario_rainy";
                else if (rawName.includes("Heatwave")) labelKey = "scenario_heatwave";

                const scenarioTranslated = t(labelKey, rawName);
                const suffix = t("triggered_suffix", "triggered");
                msgStr = `${scenarioTranslated} ${suffix}`;
              }

              return (
                <li key={e.id} className="flex items-center gap-2 text-slate-600">
                  <span className="text-[10px] text-slate-400 font-bold">{formatTime(e.ts)}</span>
                  <span>{e.emoji}</span>
                  <span className="font-semibold text-slate-800">{msgStr}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

