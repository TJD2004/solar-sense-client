import React from "react";
import { Sun, Home, Battery, Zap, Cpu, Activity, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function EnergyFlowDiagram({ solar = 0, home = 0, battery = 0, grid = 0 }) {
  const { t } = useLanguage();
  const s = parseFloat(solar) || 0;
  const h = parseFloat(home) || 0;
  const b = parseFloat(battery) || 0;
  const g = parseFloat(grid) || 0;

  // Active status checks
  const isSolarGenerating = s > 0.05;
  const isCharging = s > h;
  const isGridExporting = g >= 0;

  // Flow animation speeds scaled to real kW output
  const solarSpeed = isSolarGenerating ? Math.max(0.6, 2.0 - s * 0.2) : 4;
  const homeSpeed = h > 0 ? Math.max(0.6, 2.0 - h * 0.2) : 4;
  const batterySpeed = Math.max(0.6, 2.0 - (Math.abs(s - h) * 0.25));
  const gridSpeed = Math.max(0.6, 2.0 - Math.abs(g) * 0.2);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      <style>{`
        @keyframes energyParticle {
          0% { stroke-dashoffset: 32; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* SVG Microgrid Energy Flow Canvas */}
      <svg viewBox="0 0 720 320" className="w-full h-auto max-w-3xl overflow-visible select-none">
        <defs>
          {/* Blueprint Grid Background Pattern */}
          <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#F1F5F9" strokeWidth="1" />
          </pattern>

          {/* Soft Card Shadow */}
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.06" />
          </filter>

          {/* Glow Filters */}
          <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients */}
          <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
          <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#D1FAE5" />
          </linearGradient>
          <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F3FF" />
            <stop offset="100%" stopColor="#EDE9FE" />
          </linearGradient>
        </defs>

        {/* Blueprint Grid Surface */}
        <rect width="720" height="320" rx="16" fill="url(#gridPattern)" />

        {/* ================= FLOW PATH TRACKS ================= */}

        {/* Path 1: Solar Array (360, 55) → Inverter Hub (360, 160) */}
        <path d="M 360 55 L 360 160" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 360 55 L 360 160"
          fill="none"
          stroke={isSolarGenerating ? "#F59E0B" : "#94A3B8"}
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          style={{ animation: `energyParticle ${solarSpeed}s linear infinite` }}
        />

        {/* Path 2: Inverter Hub (360, 160) → Home Load (140, 260) */}
        <path d="M 360 160 C 260 160, 140 200, 140 260" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 360 160 C 260 160, 140 200, 140 260"
          fill="none"
          stroke="#0EA5E9"
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          style={{ animation: `energyParticle ${homeSpeed}s linear infinite` }}
        />

        {/* Path 3: Inverter Hub (360, 160) → Battery BESS (360, 260) */}
        <path d="M 360 160 L 360 260" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 360 160 L 360 260"
          fill="none"
          stroke="#10B981"
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          style={{ animation: `energyParticle ${batterySpeed}s linear infinite` }}
        />

        {/* Path 4: Inverter Hub (360, 160) → Grid Interface (580, 260) */}
        <path d="M 360 160 C 460 160, 580 200, 580 260" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 360 160 C 460 160, 580 200, 580 260"
          fill="none"
          stroke={isGridExporting ? "#8B5CF6" : "#F97316"}
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          style={{ animation: `energyParticle ${gridSpeed}s linear infinite` }}
        />

        {/* ================= NODE 1: SOLAR PV ARRAY (TOP CENTER) ================= */}
        <g transform="translate(360,48)" filter="url(#cardShadow)" className="cursor-pointer">
          <rect x="-110" y="-32" width="220" height="64" rx="14" fill="url(#solarGrad)" stroke="#F59E0B" strokeWidth="1.5" />
          
          {/* Icon Circle */}
          <circle cx="-75" cy="0" r="20" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" filter="url(#amberGlow)" />
          <foreignObject x="-85" y="-10" width="20" height="20">
            <Sun className="w-5 h-5 text-amber-500 stroke-[2.2] animate-pulse" />
          </foreignObject>

          {/* Typography */}
          <text x="-45" y="-8" className="text-[10px] font-extrabold fill-amber-900 font-display tracking-wider">
            {t("node_solar_pv", "SOLAR PV ARRAY")}
          </text>
          <text x="-45" y="12" className="text-base font-extrabold fill-slate-900 font-mono-num">
            {s.toFixed(2)} <tspan className="text-xs font-semibold fill-slate-500 font-sans">kW</tspan>
          </text>

          {/* Mini Status Tag */}
          <rect x="52" y="-18" width="48" height="16" rx="8" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
          <text x="76" y="-7" textAnchor="middle" className="text-[9px] font-bold fill-amber-800 font-display">
            {isSolarGenerating ? t("status_active", "ACTIVE") : t("status_idle", "IDLE")}
          </text>
        </g>

        {/* ================= NODE 2: SMART INVERTER HUB (CENTER CORE) ================= */}
        <g transform="translate(360,160)" filter="url(#cardShadow)">
          {/* External Spinning Pulse Ring */}
          <circle r="36" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" style={{ animation: "spinSlow 12s linear infinite", transformOrigin: "center" }} />
          
          {/* Solid Central Hub */}
          <circle r="28" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
          <circle r="22" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
          
          <foreignObject x="-11" y="-11" width="22" height="22">
            <Cpu className="w-5.5 h-5.5 text-blue-600 stroke-[2.2]" />
          </foreignObject>

          {/* Inverter Label Badge */}
          <rect x="-65" y="34" width="130" height="20" rx="10" fill="#1E293B" />
          <text x="0" y="48" textAnchor="middle" className="text-[10px] font-extrabold fill-white font-display tracking-wide">
            {t("node_mppt_hub", "MPPT HUB")} · 98.4%
          </text>
        </g>

        {/* ================= NODE 3: HOME SMART LOAD (BOTTOM LEFT) ================= */}
        <g transform="translate(140,260)" filter="url(#cardShadow)">
          <rect x="-95" y="-30" width="190" height="60" rx="14" fill="url(#homeGrad)" stroke="#0EA5E9" strokeWidth="1.5" />
          
          <circle cx="-65" cy="0" r="18" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" filter="url(#blueGlow)" />
          <foreignObject x="-74" y="-9" width="18" height="18">
            <Home className="w-4.5 h-4.5 text-sky-600 stroke-[2.2]" />
          </foreignObject>

          <text x="-36" y="-8" className="text-[10px] font-extrabold fill-sky-950 font-display tracking-wider">
            {t("node_home_load", "HOME LOAD")}
          </text>
          <text x="-36" y="12" className="text-sm font-extrabold fill-slate-900 font-mono-num">
            {h.toFixed(2)} <tspan className="text-xs font-semibold fill-slate-500 font-sans">kW</tspan>
          </text>
        </g>

        {/* ================= NODE 4: BESS BATTERY STORAGE (BOTTOM CENTER) ================= */}
        <g transform="translate(360,260)" filter="url(#cardShadow)">
          <rect x="-95" y="-30" width="190" height="60" rx="14" fill="url(#batteryGrad)" stroke="#10B981" strokeWidth="1.5" />
          
          <circle cx="-65" cy="0" r="18" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" filter="url(#emeraldGlow)" />
          <foreignObject x="-74" y="-9" width="18" height="18">
            <Battery className="w-4.5 h-4.5 text-emerald-600 stroke-[2.2]" />
          </foreignObject>

          <text x="-36" y="-8" className="text-[10px] font-extrabold fill-emerald-950 font-display tracking-wider">
            {t("node_storage_bess", "STORAGE BESS")}
          </text>
          <text x="-36" y="12" className="text-sm font-extrabold fill-slate-900 font-mono-num">
            {b}% <tspan className="text-xs font-semibold fill-emerald-600 font-sans">{isCharging ? t("status_charging", "Charging") : t("status_backup", "Backup")}</tspan>
          </text>
        </g>

        {/* ================= NODE 5: NET GRID INTERFACE (BOTTOM RIGHT) ================= */}
        <g transform="translate(580,260)" filter="url(#cardShadow)">
          <rect x="-95" y="-30" width="190" height="60" rx="14" fill="url(#gridGrad)" stroke={isGridExporting ? "#8B5CF6" : "#F97316"} strokeWidth="1.5" />
          
          <circle cx="-65" cy="0" r="18" fill="#FFFFFF" stroke={isGridExporting ? "#8B5CF6" : "#F97316"} strokeWidth="2" />
          <foreignObject x="-74" y="-9" width="18" height="18">
            <Zap className={`w-4.5 h-4.5 stroke-[2.2] ${isGridExporting ? "text-purple-600" : "text-amber-600"}`} />
          </foreignObject>

          <text x="-36" y="-8" className="text-[10px] font-extrabold fill-purple-950 font-display tracking-wider">
            {t("node_grid_interface", "GRID INTERFACE")}
          </text>
          <text x="-36" y="12" className="text-sm font-extrabold fill-slate-900 font-mono-num">
            {g >= 0 ? `+${g.toFixed(2)}` : g.toFixed(2)} <tspan className="text-xs font-semibold fill-slate-500 font-sans">kW</tspan>
          </text>
        </g>
      </svg>

      {/* Dynamic Real-Time Microgrid Power Equation Ribbon */}
      <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700 font-display">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>{t("power_balance_matrix", "Real-Time Power Balance Matrix:")}</span>
        </div>

        <div className="flex items-center gap-3 font-mono-num font-bold text-slate-800 text-xs">
          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            ☀️ {s.toFixed(2)} kW {t("solar_label", "Solar")}
          </span>
          <span className="text-slate-400">=</span>
          <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            🏠 {h.toFixed(2)} kW {t("load_label", "Load")}
          </span>
          <span className="text-slate-400">+</span>
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            🔋 {b}% {t("bess_label", "BESS")}
          </span>
          <span className="text-slate-400">+</span>
          <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            ⚡ {g >= 0 ? `+${g.toFixed(2)}` : g.toFixed(2)} kW {t("grid_label", "Grid")}
          </span>
        </div>
      </div>
    </div>
  );
}
