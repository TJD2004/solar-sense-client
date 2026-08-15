import React from "react";
import { WifiOff, Wifi, History } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function formatTime(d) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export default function ScenarioControl() {
  const { scenarios, scenarioId, setScenario, offline, toggleOffline, anomalyActive, eventLog, connection } =
    useSimulation();
  const { t } = useLanguage();

  const SCENARIO_LABELS = {
    normal: t("scenario_normal", "Normal Day"),
    cloudy: t("scenario_cloudy", "Passing Clouds"),
    shading: t("scenario_shading", "Afternoon Shading"),
    soiling: t("scenario_soiling", "Panel Dust"),
    inverter: t("scenario_inverter", "Inverter Fault"),
    rainy: t("scenario_rainy", "Heavy Rain"),
    heatwave: t("scenario_heatwave", "Extreme Heatwave"),
  };

  return (
    <div className="panel ss-alert-frame" data-alert={anomalyActive || undefined} style={{ marginBottom: 18 }}>
      <div className="panel-title">{t("scenario_title", "Digital Twin — Simulate a Condition")}</div>
      <div role="radiogroup" aria-label="Simulated condition" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
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
              className="ss-chip"
              data-active={isActive || undefined}
            >
              <span aria-hidden="true">{s.emoji}</span> {displayLabel}
            </button>
          );
        })}
        <button
          type="button"
          onClick={toggleOffline}
          aria-pressed={offline}
          className="ss-chip"
          data-active={offline || undefined}
          data-variant="danger"
          style={{ marginLeft: "auto" }}
        >
          {offline ? <WifiOff size={13} /> : <Wifi size={13} />}
          {offline ? t("meter_offline", "Meter offline") : t("simulate_drop", "Simulate connection drop")}
        </button>
      </div>

      {eventLog.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--hairline)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "var(--ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            <History size={12} /> {t("event_log_title", "Event log")}
          </div>
          <ul className="ss-event-log">
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
                <li key={e.id}>
                  <span className="ss-log-time">{formatTime(e.ts)}</span>
                  <span aria-hidden="true">{e.emoji}</span>
                  <span>{msgStr}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
