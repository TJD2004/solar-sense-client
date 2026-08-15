import React from "react";
import { Sun, Home, Battery, Zap } from "lucide-react";

// Flow speed scales with solar power: more sun = faster flowing dashes
function FlowLine({ d, color, delay = 0, duration = 1.4, strokeW = 2.4 }) {
  return (
    <g>
      <path d={d} className="flow-track" />
      <path
        d={d}
        className="flow-pulse"
        style={{
          stroke: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          strokeWidth: strokeW,
        }}
      />
    </g>
  );
}

export default function EnergyFlowDiagram({ solar, home, battery, grid }) {
  // Higher solar → faster flow lines (like water current matching power)
  const flowSpeed = solar > 0 ? Math.max(0.55, 2.6 - solar * 0.33) : 3;
  // Stroke thickness also scales with power
  const mainStroke = Math.max(1.8, Math.min(4.2, 1.8 + solar * 0.38));
  const homeStroke = Math.max(1.6, Math.min(3.2, 1.6 + home * 0.25));
  const battStroke = 2.0;
  const gridStroke = Math.max(1.6, Math.min(3.0, 1.6 + grid * 0.22));

  // Colours dim when near-zero (dead line effect)
  const solarAlpha = solar > 0.2 ? 1 : 0.3;
  const gridAlpha = grid > 0.1 ? 1 : 0.25;

  return (
    <div className="flow-diagram">
      <svg viewBox="0 0 640 240" className="flow-svg">
        {/* Tracks + animated pulses */}
        <FlowLine d="M 320 38 L 320 108" color={`rgba(255,153,51,${solarAlpha})`} delay={0} duration={flowSpeed} strokeW={mainStroke} />
        <FlowLine d="M 320 108 L 130 190" color={`rgba(255,153,51,${solarAlpha})`} delay={0.2} duration={flowSpeed * 1.1} strokeW={homeStroke} />
        <FlowLine d="M 320 108 L 320 190" color="var(--india-green)" delay={0.45} duration={flowSpeed * 1.2} strokeW={battStroke} />
        <FlowLine d="M 320 108 L 510 190" color={`rgba(91,156,232,${gridAlpha})`} delay={0.7} duration={flowSpeed * 1.3} strokeW={gridStroke} />

        {/* ☀️ Sun node */}
        <g transform="translate(320,36)">
          <circle r="28" className="node-sun-ring" style={{ r: 28 + (solar > 3 ? 4 : 0), opacity: 0.9 + solar * 0.02 }} />
          <foreignObject x="-14" y="-14" width="28" height="28">
            <Sun size={28} color="var(--saffron)" strokeWidth={2.2} />
          </foreignObject>
        </g>

        {/* Solar kW label on the main downline */}
        <text x="342" y="80" className="flow-power-label" fill="var(--saffron)" style={{ opacity: solarAlpha }}>
          {solar} kW
        </text>

        {/* PV hub node */}
        <g transform="translate(320,108)">
          <circle r="20" className="node-panel" />
          <text textAnchor="middle" dy="5" className="node-panel-label">PV</text>
        </g>

        {/* 🏠 Home node */}
        <g transform="translate(130,206)">
          <circle r="24" className="node-generic" />
          <foreignObject x="-12" y="-12" width="24" height="24">
            <Home size={22} color="var(--ink-100)" strokeWidth={2} />
          </foreignObject>
        </g>
        {/* Home label */}
        <text x="130" y="238" textAnchor="middle" className="flow-power-label" fill="var(--saffron)" style={{ opacity: solarAlpha }}>
          {home} kW
        </text>

        {/* 🔋 Battery node */}
        <g transform="translate(320,206)">
          <circle r="24" className="node-generic" />
          <foreignObject x="-12" y="-12" width="24" height="24">
            <Battery size={22} color="var(--india-green)" strokeWidth={2} />
          </foreignObject>
        </g>
        {/* Battery label */}
        <text x="320" y="238" textAnchor="middle" className="flow-power-label" fill="var(--india-green)">
          {battery}%
        </text>

        {/* ⚡ Grid node */}
        <g transform="translate(510,206)">
          <circle r="24" className="node-generic" />
          <foreignObject x="-12" y="-12" width="24" height="24">
            <Zap size={22} color="var(--chakra-blue-light)" strokeWidth={2} style={{ opacity: gridAlpha }} />
          </foreignObject>
        </g>
        {/* Grid label */}
        <text x="510" y="238" textAnchor="middle" className="flow-power-label" fill="var(--chakra-blue-light)" style={{ opacity: gridAlpha }}>
          {grid} kW
        </text>
      </svg>
    </div>
  );
}
