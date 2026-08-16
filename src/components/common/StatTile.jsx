import React, { useEffect, useRef } from "react";

export default function StatTile({ icon: Icon, label, value, unit, accent = "#F59E0B" }) {
  const ref = useRef(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      const el = ref.current;
      if (!el) return;
      el.classList.remove("stat-tile--flash");
      void el.offsetWidth;
      el.classList.add("stat-tile--flash");
    }
  }, [value]);

  return (
    <div
      ref={ref}
      className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 transition-all hover:bg-white hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)]"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        <Icon className="w-5 h-5 stroke-[2.2]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-extrabold font-mono-num text-slate-900 flex items-baseline gap-0.5">
          <span>{value}</span>
          <span className="text-xs font-medium text-slate-500 font-sans ml-0.5">{unit}</span>
        </div>
        <div className="text-[11px] font-semibold text-slate-500 truncate leading-tight mt-0.5">{label}</div>
      </div>
    </div>

  );
}

