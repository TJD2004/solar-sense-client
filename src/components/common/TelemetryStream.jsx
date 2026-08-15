import React, { useEffect, useRef, useState } from "react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

// Single telemetry metric tile — flashes green on every value change
function TelField({ label, value, unit, color = "var(--chakra-blue-light)" }) {
  const ref = useRef(null);
  const prevVal = useRef(value);

  useEffect(() => {
    if (prevVal.current !== value) {
      prevVal.current = value;
      const el = ref.current;
      if (!el) return;
      el.classList.remove("telem-flash");
      void el.offsetWidth; // force CSS reflow so re-add triggers animation
      el.classList.add("telem-flash");
    }
  }, [value]);

  return (
    <div className="telem-field" ref={ref}>
      <div className="telem-label">{label}</div>
      <div className="telem-value" style={{ color }}>
        {value ?? "—"}
        {unit && <span className="telem-unit">{unit}</span>}
      </div>
    </div>
  );
}

export default function TelemetryStream() {
  const { live, connection, scenarioId } = useSimulation();
  const { t } = useLanguage();
  const [packetCount, setPacketCount] = useState(live?.tick ?? 0);

  useEffect(() => {
    setPacketCount((n) => n + 1);
  }, [live?.solar]);

  if (!live) return null;

  const packet = live.tick ?? packetCount;

  const battDisplay =
    live.battPower != null
      ? (live.battPower >= 0 ? "+" : "") + live.battPower
      : "—";
  const battColor = (live.battPower ?? 0) >= 0 ? "var(--india-green)" : "var(--saffron-deep)";

  const gridDisplay =
    live.gridNet != null ? (live.gridNet >= 0 ? "+" : "") + live.gridNet : "—";
  const gridColor = (live.gridNet ?? 0) >= 0 ? "var(--india-green)" : "#ff8c42";

  const sourceLabel = connection === "live" ? t("inverter_source", "INVERTER") : t("sim_source", "SIM");
  const sourceColor = connection === "live" ? "var(--india-green)" : "var(--ink-500)";

  const fields = [
    { label: t("ac_voltage", "AC Voltage"),    value: live.acVoltage,    unit: " V",    color: "var(--chakra-blue-light)" },
    { label: t("ac_frequency", "AC Frequency"),  value: live.acFrequency,  unit: " Hz",   color: "var(--chakra-blue-light)" },
    { label: t("dc_voltage", "DC Voltage"),    value: live.dcVoltage,    unit: " V",    color: "#7eb8ff" },
    { label: t("dc_current", "DC Current"),    value: live.dcCurrent,    unit: " A",    color: "#7eb8ff" },
    { label: t("irradiance", "Irradiance"),    value: live.irradiance,   unit: " W/m²", color: "var(--saffron)" },
    { label: t("panel_temp", "Panel Temp"),    value: live.panelTemp,    unit: " °C",   color: "#ff8c42" },
    { label: t("ambient_temp", "Ambient Temp"),  value: live.ambientTemp,  unit: " °C",   color: "var(--ink-300)" },
    { label: t("power_factor", "Power Factor"),  value: live.powerFactor,  unit: "",      color: "var(--india-green)" },
    { label: t("efficiency", "Efficiency"),    value: live.efficiency,   unit: " %",    color: "var(--india-green)" },
    { label: t("battery_flow", "Battery Flow"),  value: battDisplay,       unit: " kW",   color: battColor },
    { label: t("grid_net", "Grid Net"),      value: gridDisplay,       unit: " kW",   color: gridColor },
    { label: t("telemetry_source", "Source"),  value: sourceLabel,       unit: "",      color: sourceColor },
  ];

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      {/* Header */}
      <div className="panel-title" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span>⚡ {t("telemetry_title", "Inverter Data Stream")}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "var(--ink-500)",
              letterSpacing: "0.04em",
            }}
          >
            {t("pkt_num", "PKT #")}{String(packet).padStart(4, "0")}
          </span>
          <span className="telem-live-badge">
            <span className="telem-dot" />
            {connection === "live" ? t("live_telemetry", "LIVE TELEMETRY") : t("simulated_telemetry", "SIMULATED")}
          </span>
        </span>
      </div>

      {/* Scenario context hint */}
      <div
        style={{
          fontSize: 11,
          color: "var(--ink-500)",
          marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.03em",
        }}
      >
        {"▸ "}
        {scenarioId === "normal" && (t("scenario_normal", "Clear sky") + " — 100%")}
        {scenarioId === "cloudy" && ("⚠ " + t("scenario_cloudy", "Passing Clouds"))}
        {scenarioId === "rainy" && ("🌧️ " + t("scenario_rainy", "Heavy Rain"))}
        {scenarioId === "heatwave" && ("🔥 " + t("scenario_heatwave", "Extreme Heatwave"))}
        {scenarioId === "shading" && ("⚠ " + t("scenario_shading", "Afternoon Shading"))}
        {scenarioId === "soiling" && ("⚠ " + t("scenario_soiling", "Panel Dust"))}
        {scenarioId === "inverter" && ("🚨 " + t("scenario_inverter", "Inverter Fault"))}
      </div>

      {/* 12-field telemetry grid */}
      <div className="telem-grid">
        {fields.map((f) => (
          <TelField key={f.label} {...f} />
        ))}
      </div>
    </div>
  );
}
