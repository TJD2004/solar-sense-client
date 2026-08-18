import React, { useEffect, useState } from "react";
import { Sun, Home, Battery, Zap, Gauge, AlertTriangle, Activity, Wrench } from "lucide-react";

import StatTile from "../../components/common/StatTile.jsx";
import ImpactCards from "../../components/common/ImpactCards.jsx";
import EnergyFlowDiagram from "../../components/SolarFlow/EnergyFlowDiagram.jsx";
import ChakraGauge from "../../components/HealthScore/ChakraGauge.jsx";
import GenerationChart from "../../components/EnergyChart/GenerationChart.jsx";
import AIInsightCard from "../../components/AIInsight/AIInsightCard.jsx";
import ScenarioControl from "../../components/common/ScenarioControl.jsx";
import TelemetryStream from "../../components/common/TelemetryStream.jsx";
import { PanelSkeleton, ErrorState } from "../../components/common/AsyncState.jsx";
import { callOrFallback, analyzePerformance } from "../../services/api.js";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

import VoiceSummaryButton from "../../components/common/VoiceSummaryButton.jsx";
import MLPredictionCard from "../../components/MLShowcase/MLPredictionCard.jsx";
import MLJudgesCard from "../../components/MLShowcase/MLJudgesCard.jsx";

export default function Dashboard() {
  const { initializing, offline, toggleOffline, live, curve, healthScore, anomalyActive, scenario, openServiceModal } = useSimulation();
  const { t } = useLanguage();

  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setInsightLoading(true);
    callOrFallback(
      () => analyzePerformance({}),
      () => ({ ...scenario.insight, source: "heuristic" })
    ).then((result) => {
      if (!cancelled) {
        setInsight(result);
        setInsightLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [scenario.id, healthScore]);

  if (initializing) {
    return (
      <div className="space-y-6">
        <PanelSkeleton rows={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PanelSkeleton rows={5} />
          <PanelSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (offline) {
    return <ErrorState onRetry={toggleOffline} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Controls & Voice Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            {t("sys_ops_overview", "System Operations Overview")}
          </h1>
          <p className="text-xs text-slate-500 font-medium">{t("sys_ops_sub", "Real-time solar generation telemetry & generative AI performance insights.")}</p>
        </div>
        <VoiceSummaryButton />
      </div>

      {/* Anomaly Alert Banner */}
      {anomalyActive && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-sm font-medium">
              {scenario.id === "inverter"
                ? `🚨 ${t("alert_inverter", "Inverter Hardware Failure")} — ${t("inverter_halted", "Power generation halted. Hardware check required.")}`
                : scenario.id === "soiling"
                ? `🧹 ${t("alert_soiling", "Panel Soiling & Dust Alert")} — ${t("soiling_desc_banner", "Dust buildup is reducing panel absorption. Cleaning recommended.")}`
                : scenario.id === "shading"
                ? `🌳 ${t("alert_shading", "Array Shading Alert")} — ${t("shading_desc_banner", "Partial tree or structure shadow obstructing solar array.")}`
                : (live?.panelTemp >= 45 || live?.ambientTemp >= 40)
                ? `🔥 ${t("alert_temp_high", "High Panel Temperature Alert")} — ${live?.panelTemp ?? live?.ambientTemp}°C (${t("thermal_loss", "Thermal Efficiency Degradation")})`
                : (live?.irradiance <= 350)
                ? `☁️ ${t("alert_cloudy", "Cloud Cover / Low Irradiance Alert")} — ${live?.irradiance} W/m²`
                : scenario.id === "normal"
                ? t("anomaly_normal", "Production anomaly detected — output dropped sharply in the last interval.")
                : `${scenario.emoji} ${t("anomaly_detected", "Production anomaly detected")} — ${t("scenario_" + scenario.id, scenario.label)}`}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              openServiceModal({
                issue: scenario.id === "inverter" ? "inverter_fault" : scenario.id === "soiling" ? "soiling" : "shading",
                notes: "Anomaly detected from Dashboard banner",
              })
            }
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t("btn_contact_tech", "Contact Technician")}</span>
          </button>
        </div>
      )}

      {/* Interactive Scenario Controls */}
      <ScenarioControl />


      {/* Main Grid: Energy Flow Diagram & Live Telemetry Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-Time Energy Flow Matrix */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wide uppercase font-display mb-4">
            <Activity className="w-4 h-4 text-amber-500 stroke-[2.5]" />
            <span>{t("energy_flow_title", "Real-Time Energy Flow Matrix")}</span>
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            <EnergyFlowDiagram solar={live?.solar ?? 0} home={live?.home ?? 0} battery={live?.battery ?? 0} grid={live?.grid ?? 0} />
          </div>
        </div>

        {/* Right: Live Telemetry Card (Metric Tiles + Chakra Gauge) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wide uppercase font-display">
              <Gauge className="w-4 h-4 text-sky-500 stroke-[2.5]" />
              <span>{t("live_telemetry", "Live Telemetry")}</span>
            </div>
            <span className="text-xs font-mono-num font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              OPTIMAL
            </span>
          </div>

          {/* 4 Telemetry Mini Metric Tiles Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile icon={Sun} label={t("solar_generation", "Solar Generation")} value={live?.solar ?? 0} unit="kW" accent="#F59E0B" />
            <StatTile icon={Home} label={t("home_consumption", "Home Consumption")} value={live?.home ?? 0} unit="kW" accent="#0EA5E9" />
            <StatTile icon={Battery} label={t("battery_charge", "Battery Charge")} value={live?.battery ?? 0} unit="%" accent="#10B981" />
            <StatTile icon={Zap} label={t("grid_export", "Grid Export Ratio")} value={live?.grid ?? 0} unit="kW" accent="#F97316" />
          </div>

          {/* Centered Chakra Health Gauge */}
          <div className="pt-2 flex justify-center">
            <ChakraGauge score={healthScore ?? 87} label={t("solar_health_score", "Solar Health Index")} />
          </div>
        </div>
      </div>


      {/* Telemetry Stream */}
      <TelemetryStream />

      {/* Center Row: Generation Curve & Carbon Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GenerationChart data={curve || []} />
        </div>
        <div className="lg:col-span-4">
          <ImpactCards />
        </div>
      </div>

      {/* AI Sense Dedicated Insight Box outlined in AI Accent Color */}
      <AIInsightCard
        title={t("ai_detective_title", (insight || scenario?.insight || {}).title || "Solar Performance Detective")}
        body={(insight || scenario?.insight || {}).body || "Production is running close to expected levels."}
        tags={(insight || scenario?.insight || {}).tags || ["☁️ Cloud cover", "🌳 Shading"]}
        source={insight?.source}
        loading={insightLoading}
      />


      {/* ML Predictive & Judges Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MLPredictionCard />
        <MLJudgesCard />
      </div>
    </div>
  );
}

