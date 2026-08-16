import React, { useEffect, useRef, useState } from "react";
import { Zap, Radio } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

// Single telemetry metric tile
function TelField({ label, value, unit, color = "#0EA5E9" }) {
  const ref = useRef(null);
  const prevVal = useRef(value);

  useEffect(() => {
    if (prevVal.current !== value) {
      prevVal.current = value;
      const el = ref.current;
      if (!el) return;
      el.classList.remove("telem-flash");
      void el.offsetWidth; // force CSS reflow
      el.classList.add("telem-flash");
    }
  }, [value]);

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1 transition-all" ref={ref}>
      <div className="text-[11px] font-semibold text-slate-500 truncate">{label}</div>
      <div className="text-base font-extrabold font-mono-num" style={{ color: color || "#0F172A" }}>
        {value ?? "—"}
        {unit && <span className="text-xs font-medium text-slate-500 font-sans ml-0.5">{unit}</span>}
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
  const battColor = (live.battPower ?? 0) >= 0 ? "#10B981" : "#F59E0B";

  const gridDisplay =
    live.gridNet != null ? (live.gridNet >= 0 ? "+" : "") + live.gridNet : "—";
  const gridColor = (live.gridNet ?? 0) >= 0 ? "#10B981" : "#F59E0B";

  const sourceLabel = connection === "live" ? t("inverter_source", "INVERTER") : t("sim_source", "DIGITAL TWIN");
  const sourceColor = connection === "live" ? "#10B981" : "#64748B";

  const fields = [
    { label: t("ac_voltage", "AC Voltage"), value: live.acVoltage, unit: "V", color: "#0EA5E9" },
    { label: t("ac_frequency", "AC Frequency"), value: live.acFrequency, unit: "Hz", color: "#0EA5E9" },
    { label: t("dc_voltage", "DC Voltage"), value: live.dcVoltage, unit: "V", color: "#0284C7" },
    { label: t("dc_current", "DC Current"), value: live.dcCurrent, unit: "A", color: "#0284C7" },
    { label: t("irradiance", "Irradiance"), value: live.irradiance, unit: "W/m²", color: "#F59E0B" },
    { label: t("panel_temp", "Panel Temp"), value: live.panelTemp, unit: "°C", color: "#F97316" },
    { label: t("ambient_temp", "Ambient Temp"), value: live.ambientTemp, unit: "°C", color: "#64748B" },
    { label: t("power_factor", "Power Factor"), value: live.powerFactor, unit: "", color: "#10B981" },
    { label: t("efficiency", "Efficiency"), value: live.efficiency, unit: "%", color: "#10B981" },
    { label: t("battery_flow", "Battery Flow"), value: battDisplay, unit: "kW", color: battColor },
    { label: t("grid_net", "Grid Net"), value: gridDisplay, unit: "kW", color: gridColor },
    { label: t("telemetry_source", "Source"), value: sourceLabel, unit: "", color: sourceColor },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wide uppercase font-display">
          <Zap className="w-4 h-4 text-amber-500 stroke-[2.5]" />
          <span>{t("telemetry_title", "Inverter Live Data Telemetry Stream")}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono-num text-xs font-bold text-slate-500">
            {t("pkt_num", "PKT #")}{String(packet).padStart(4, "0")}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono-num font-bold border border-emerald-200">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            {connection === "live" ? t("live_telemetry", "LIVE TELEMETRY") : t("simulated_telemetry", "SIMULATED TWIN")}
          </span>
        </div>
      </div>

      {/* 12-field telemetry grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {fields.map((f) => (
          <TelField key={f.label} {...f} />
        ))}
      </div>
    </div>
  );
}

