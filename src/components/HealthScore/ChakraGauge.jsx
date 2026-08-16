import React, { useMemo } from "react";

const CHAKRA_SPOKES = 24;

export default function ChakraGauge({ score = 87, label = "Solar Health Index" }) {
  const safeScore = typeof score === "number" && !isNaN(score) ? score : 87;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 72;
  const rInner = 28;
  const circumference = 2 * Math.PI * rOuter;
  const dash = (safeScore / 100) * circumference;

  const statusText =
    safeScore >= 85 ? "Optimal System Performance" : safeScore >= 65 ? "Fair Operational Efficiency" : "Attention Required";
  const statusColor = safeScore >= 85 ? "text-emerald-600" : safeScore >= 65 ? "text-amber-600" : "text-rose-600";

  const spokes = useMemo(() => {
    return Array.from({ length: CHAKRA_SPOKES }).map((_, i) => {
      const angle = (i / CHAKRA_SPOKES) * 2 * Math.PI;
      const x1 = cx + rInner * Math.cos(angle);
      const y1 = cy + rInner * Math.sin(angle);
      const x2 = cx + (rOuter - 6) * Math.cos(angle);
      const y2 = cy + (rOuter - 6) * Math.sin(angle);
      return { x1, y1, x2, y2, key: i };
    });
  }, [cx, cy]);

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-2">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <linearGradient id="chakraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#F1F5F9" strokeWidth="12" />

          {/* Animated progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill="none"
            stroke="url(#chakraGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-700 ease-out"
          />

          {/* Decorative spokes */}
          <g opacity="0.15">
            {spokes.map((s) => (
              <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#0F172A" strokeWidth="1.2" />
            ))}
          </g>

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r={rInner} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        </svg>

        {/* Center Readout Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-3xl font-extrabold text-slate-900 font-mono-num tracking-tight">{safeScore}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">{label}</span>
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <div className={`text-xs font-bold font-display ${statusColor}`}>{statusText}</div>
        <div className="text-[11px] font-medium text-slate-400">Continuous telemetry verification active</div>
      </div>
    </div>
  );
}

