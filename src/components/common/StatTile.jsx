import React, { useEffect, useRef } from "react";

export default function StatTile({ icon: Icon, label, value, unit, accent }) {
  const ref = useRef(null);
  const prevValue = useRef(value);

  // Flash border-glow on every new value (same animation as telem-flash)
  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      const el = ref.current;
      if (!el) return;
      el.classList.remove("stat-tile--flash");
      void el.offsetWidth; // force reflow
      el.classList.add("stat-tile--flash");
    }
  }, [value]);

  return (
    <div className="stat-tile" ref={ref}>
      <div className="stat-icon" style={{ background: `${accent}22`, color: accent }}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div>
        <div className="stat-value">
          {value}
          <span className="stat-unit">{unit}</span>
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
