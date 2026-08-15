import React, { useMemo, useState } from "react";
import { SlidersHorizontal, ArrowRight, Sun, Battery, TrendingUp } from "lucide-react";
import { WHAT_IF_TOGGLES, simulateWhatIf } from "../../services/simulator.js";
import { deriveMonthlyImpact } from "../../services/derive.js";
import { useSimulation } from "../../context/SimulationContext.jsx";

export default function Simulator() {
  const { baselineSystem, initializing } = useSimulation();
  const [active, setActive] = useState([]);
  const simulated = useMemo(() => simulateWhatIf(active, baselineSystem), [active, baselineSystem]);

  const currentImpact = useMemo(() => deriveMonthlyImpact({ dailyKWh: baselineSystem.dailyKWh }), [baselineSystem]);
  const simulatedImpact = useMemo(() => deriveMonthlyImpact({ dailyKWh: simulated.dailyKWh }), [simulated]);

  function toggle(id) {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  if (initializing) {
    return <div className="panel" aria-busy="true">Loading today's baseline generation…</div>;
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">
          <SlidersHorizontal size={14} /> What-If Simulator
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-300)", margin: "0 0 16px", lineHeight: 1.5 }}>
          Toggle scenarios to see how they'd change your daily generation and monthly savings — before you spend
          on new hardware or change how you use power. "Current" reflects today's live generation, including any
          condition simulated on the Dashboard.
        </p>
        <div role="group" aria-label="What-if toggles" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {WHAT_IF_TOGGLES.map((t) => {
            const isActive = active.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggle(t.id)}
                className="ss-chip"
                data-active={isActive || undefined}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
        <SystemCard
          title="Current"
          system={{ capacityKW: baselineSystem.capacityKW, dailyKWh: baselineSystem.dailyKWh, monthlySavings: currentImpact.savings }}
        />
        <ArrowRight size={22} color="var(--ink-500)" aria-hidden="true" />
        <SystemCard
          title="Simulated"
          system={{ capacityKW: simulated.capacityKW, dailyKWh: simulated.dailyKWh, monthlySavings: simulatedImpact.savings }}
          highlight
        />
      </div>
    </div>
  );
}

function SystemCard({ title, system, highlight }) {
  return (
    <div
      className="panel"
      style={{
        border: highlight ? "1px solid var(--india-green)" : "1px solid var(--hairline)",
        background: highlight
          ? "linear-gradient(180deg, rgba(31,174,92,0.08), var(--navy-panel-2))"
          : undefined,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </div>
      <Row icon={Sun} label="Capacity" value={`${system.capacityKW} kW`} />
      <Row icon={Battery} label="Daily generation" value={`${system.dailyKWh} kWh`} />
      <Row icon={TrendingUp} label="Monthly savings" value={`₹${system.monthlySavings.toLocaleString("en-IN")}`} accent="var(--india-green)" />
    </div>
  );
}

function Row({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--hairline)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-300)" }}>
        <Icon size={13} aria-hidden="true" /> {label}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 14, color: accent || "var(--ink-100)" }}>
        {value}
      </div>
    </div>
  );
}
