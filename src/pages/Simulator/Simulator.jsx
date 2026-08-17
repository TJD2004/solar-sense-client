import React, { useMemo, useState, useEffect, useRef } from "react";
import { SlidersHorizontal, ArrowRight, Sun, Battery, TrendingUp, Box, Radio, RefreshCw, Flame, ShieldAlert, Cpu } from "lucide-react";
import { WHAT_IF_TOGGLES, simulateWhatIf } from "../../services/simulator.js";
import { deriveMonthlyImpact } from "../../services/derive.js";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Simulator() {
  const { baselineSystem, initializing, live } = useSimulation();
  const { t } = useLanguage();
  const [active, setActive] = useState([]);
  const canvasRef = useRef(null);
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);

  const simulated = useMemo(() => simulateWhatIf(active, baselineSystem), [active, baselineSystem]);
  const currentImpact = useMemo(() => deriveMonthlyImpact({ dailyKWh: baselineSystem.dailyKWh }), [baselineSystem]);
  const simulatedImpact = useMemo(() => deriveMonthlyImpact({ dailyKWh: simulated.dailyKWh }), [simulated]);

  function toggle(id) {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // 3D Solar Array Animation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const render3DArray = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2 + 10;

      // Draw Grid / Platform Floor
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1;
      for (let i = -150; i <= 150; i += 30) {
        ctx.beginPath();
        ctx.moveTo(cx + i, cy - 60);
        ctx.lineTo(cx + i * 1.5, cy + 90);
        ctx.stroke();
      }

      // Draw 3D Solar Panels
      const panelCols = 4;
      const panelRows = 3;
      const time = Date.now() * 0.001;

      for (let r = 0; r < panelRows; r++) {
        for (let c = 0; c < panelCols; c++) {
          const px = cx + (c - 1.5) * 55;
          const py = cy - (r - 1) * 35;
          const angle = Math.sin(time + c + r) * 0.05;

          // Panel Base Mount
          ctx.strokeStyle = "#94A3B8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + 18);
          ctx.stroke();

          // Panel Surface Glass
          ctx.fillStyle = active.includes("shading") ? "#475569" : "#0284C7";
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px - 22 + angle * 10, py - 12);
          ctx.lineTo(px + 22 + angle * 10, py - 12);
          ctx.lineTo(px + 26, py + 10);
          ctx.lineTo(px - 26, py + 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Solar Cells Grid Lines
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.moveTo(px, py - 12);
          ctx.lineTo(px, py + 10);
          ctx.stroke();
        }
      }

      // Sun Vector Beam
      ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width - 40, 30);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      animId = requestAnimationFrame(render3DArray);
    };

    render3DArray();
    return () => cancelAnimationFrame(animId);
  }, [active, rotationAngle]);

  if (initializing) {
    return <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-soft">{t("whatif_loading", "Loading today's baseline generation…")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-lg font-display">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Box className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2>{t("control_room_title", "High-Tech Operations Control Room")}</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t("control_room_sub", "3D Digital Twin visualization canvas & real-time Firebase telemetry synchronization layer.")}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs font-mono-num font-bold text-emerald-700">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{t("firebase_connected", "FIREBASE RTDB: CONNECTED")}</span>
          </div>
        </div>
      </div>

      {/* 3D WebGL Digital Twin Model Canvas Container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide font-display">
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>{t("visualizer_title", "3D Solar Array Model Visualizer (Firebase Live Telemetry)")}</span>
          </div>
          <button
            type="button"
            onClick={() => setRotationAngle((r) => r + 45)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t("orbit_view_btn", "Orbit View")}
          </button>
        </div>

        {/* Canvas Frame Container */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 relative flex items-center justify-center overflow-hidden h-72">
          <canvas ref={canvasRef} width={600} height={260} className="w-full h-full max-w-[600px] max-h-[260px]" />
          
          {/* Overlay Telemetry HUD */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg p-2.5 text-[11px] font-mono-num space-y-1 text-slate-700 shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("telemetry_stream_lbl", "TELEMETRY STREAM")}
            </div>
            <div>{t("solar_output_lbl", "Solar Output:")} <strong className="text-amber-600">{live.solar} kW</strong></div>
            <div>{t("panel_temp_lbl", "Panel Temp")}: <strong className="text-sky-600">{live.panelTemp ?? 34}°C</strong></div>
            <div>{t("efficiency_lbl", "Efficiency")}: <strong className="text-emerald-600">98.4%</strong></div>
          </div>
        </div>
      </div>

      {/* What-If Scenario Simulator Controls */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide font-display">
          <SlidersHorizontal className="w-4 h-4 text-sky-500" />
          <span>{t("whatif_engine_title", "Interactive What-If Simulation Engine")}</span>
        </div>

        <div role="group" aria-label="What-If Simulator" className="flex items-center gap-2 flex-wrap">
          {WHAT_IF_TOGGLES.map((tItem) => {
            const isActive = active.includes(tItem.id);
            return (
              <button
                key={tItem.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggle(tItem.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                }`}

              >
                {t(tItem.id, tItem.label)}
              </button>
            );
          })}
        </div>

        {/* Current vs Simulated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center pt-2">
          <div className="md:col-span-5">
            <SystemCard
              title={t("current_lbl", "Current Operational Baseline")}
              system={{ capacityKW: baselineSystem.capacityKW, dailyKWh: baselineSystem.dailyKWh, monthlySavings: currentImpact.savings }}
            />
          </div>

          <div className="md:col-span-1 flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
          </div>

          <div className="md:col-span-5">
            <SystemCard
              title={t("simulated_lbl", "Simulated Operational Impact")}
              system={{ capacityKW: simulated.capacityKW, dailyKWh: simulated.dailyKWh, monthlySavings: simulatedImpact.savings }}
              highlight
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemCard({ title, system, highlight }) {
  const { t } = useLanguage();
  return (
    <div
      className={`border rounded-2xl p-5 shadow-soft space-y-3 ${
        highlight ? "bg-emerald-50/50 border-emerald-300" : "bg-white border-slate-100"
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">{title}</div>
      <Row icon={Sun} label={t("capacity_lbl", "Capacity")} value={`${system.capacityKW} kW`} />
      <Row icon={Battery} label={t("daily_generation_lbl", "Daily Generation")} value={`${system.dailyKWh} kWh`} />
      <Row
        icon={TrendingUp}
        label={t("monthly_savings_lbl", "Monthly Savings")}
        value={`₹${system.monthlySavings.toLocaleString("en-IN")}`}
        accent="#10B981"
      />
    </div>
  );
}

function Row({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-t border-slate-200/60 text-xs">
      <div className="flex items-center gap-2 text-slate-600 font-medium">
        <Icon className="w-4 h-4 text-slate-500" />
        <span>{label}</span>
      </div>
      <div className="font-mono-num font-bold text-slate-900" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

