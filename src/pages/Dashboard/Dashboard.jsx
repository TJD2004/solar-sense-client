import React, { useEffect, useState } from "react";
import { Sun, Home, Battery, Zap, Gauge, AlertTriangle } from "lucide-react";

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
  const { initializing, offline, toggleOffline, live, curve, healthScore, anomalyActive, scenario } = useSimulation();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id, healthScore]);

  if (initializing) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <PanelSkeleton rows={4} />
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
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
    <div>
      <div>
        <VoiceSummaryButton />

        {anomalyActive && (
          <div className="anomaly-banner" role="status">
            <AlertTriangle size={16} aria-hidden="true" />
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
              : `${scenario.emoji} ${t("anomaly_detected", "Production anomaly detected")} — ${scenario.label}`}
          </div>
        )}

        <ScenarioControl />

        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 18, marginBottom: 18 }}>
          <div className="panel">
            <div className="panel-title">
              <Zap size={14} /> {t("energy_flow_title", "Real-Time Energy Flow")}
            </div>
            <EnergyFlowDiagram solar={live.solar} home={live.home} battery={live.battery} grid={live.grid} />
          </div>
          <div className="panel">
            <div className="panel-title">
              <Gauge size={14} /> {t("live_telemetry", "Live Telemetry")}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <StatTile icon={Sun} label={t("solar_generation", "Generation")} value={live.solar} unit="kW" accent="#FF9933" />
              <StatTile icon={Home} label={t("home_consumption", "Consumption")} value={live.home} unit="kW" accent="#5B9CE8" />
              <StatTile icon={Battery} label={t("battery_charge", "Battery")} value={live.battery} unit="%" accent="#1FAE5C" />
              <StatTile icon={Zap} label={t("grid_export", "Grid Net")} value={live.grid} unit="kW" accent="#FF7A1A" />
            </div>
            <ChakraGauge score={healthScore} label={t("solar_health_score", "Solar Health")} />
          </div>
        </div>

        <TelemetryStream />

        <div className="mid-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 18 }}>
          <GenerationChart data={curve} />
          <ImpactCards />
        </div>

        <AIInsightCard
          title={t("ai_detective_title", (insight || scenario.insight).title)}
          body={(insight || scenario.insight).body}
          tags={(insight || scenario.insight).tags}
          source={insight?.source}
          loading={insightLoading}
        />

        {/* ML Prediction + Hackathon Judges Showcase */}
        <div
          className="ml-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}
        >
          <MLPredictionCard />
          <MLJudgesCard />
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .hero-grid, .mid-grid, .ml-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .hero-grid .panel > div[style*="repeat(4,1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
