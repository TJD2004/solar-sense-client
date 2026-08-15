import React, { useMemo } from "react";

const CHAKRA_SPOKES = 24;

export default function ChakraGauge({ score = 87, label = "Solar Health" }) {
  const size = 168;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 74;
  const rInner = 30;
  const circumference = 2 * Math.PI * rOuter;
  const dash = (score / 100) * circumference;

  const spokes = useMemo(() => {
    return Array.from({ length: CHAKRA_SPOKES }).map((_, i) => {
      const angle = (i / CHAKRA_SPOKES) * 2 * Math.PI;
      const x1 = cx + rInner * Math.cos(angle);
      const y1 = cy + rInner * Math.sin(angle);
      const x2 = cx + (rOuter - 4) * Math.cos(angle);
      const y2 = cy + (rOuter - 4) * Math.sin(angle);
      return { x1, y1, x2, y2, key: i };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="chakra-wrap">
      <svg width="0" height="0">
        <defs>
          <linearGradient id="chakraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--saffron)" />
            <stop offset="100%" stopColor="var(--india-green)" />
          </linearGradient>
        </defs>
      </svg>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={rOuter} className="chakra-track" />
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          className="chakra-progress"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <g className="chakra-spokes">
          {spokes.map((s) => (
            <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={rInner} className="chakra-hub" />
      </svg>
      <div className="chakra-readout">
        <span className="chakra-score">{score}</span>
        <span className="chakra-label">{label}</span>
      </div>
    </div>
  );
}
