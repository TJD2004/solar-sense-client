import React, { useEffect, useState } from "react";
import { Plus, Zap, Clock, TrendingDown, Sparkles } from "lucide-react";
import { recommendWindow } from "../../services/simulator.js";
import { callOrFallback, getScheduleRecommendation } from "../../services/api.js";
import { EmptyState, PanelSkeleton } from "../../components/common/AsyncState.jsx";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Scheduler() {
  const { curve, initializing } = useSimulation();
  const { t } = useLanguage();

  const DEFAULT_APPLIANCES = [
    { id: 1, name: t("appliance_washing", "Washing Machine"), powerKW: 1.2, durationHours: 1 },
    { id: 2, name: t("appliance_ac", "Air Conditioner"), powerKW: 2, durationHours: 0.75 },
    { id: 3, name: t("appliance_ev", "EV Charger"), powerKW: 3.3, durationHours: 2 },
  ];

  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES);
  const [form, setForm] = useState({ name: "", powerKW: "", durationHours: "" });
  const [formError, setFormError] = useState("");
  const [recsById, setRecsById] = useState({});

  useEffect(() => {
    let cancelled = false;
    appliances.forEach((a) => {
      callOrFallback(
        () => getScheduleRecommendation({ name: a.name, powerKW: a.powerKW, durationHours: a.durationHours }),
        () => ({ ...recommendWindow(curve, a.durationHours, a.powerKW), source: "heuristic" })
      ).then((rec) => {
        if (!cancelled) setRecsById((prev) => ({ ...prev, [a.id]: rec }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [appliances, curve]);

  const recommendations = appliances.map((a) => ({
    ...a,
    recommendation: recsById[a.id] || recommendWindow(curve, a.durationHours, a.powerKW),
  }));

  function addAppliance(e) {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Give the appliance a name.");
    const power = parseFloat(form.powerKW);
    const duration = parseFloat(form.durationHours);
    if (!(power > 0)) return setFormError("Power must be a number greater than 0.");
    if (!(duration > 0)) return setFormError("Duration must be a number greater than 0.");

    setFormError("");
    setAppliances((prev) => [...prev, { id: Date.now(), name: form.name.trim(), powerKW: power, durationHours: duration }]);
    setForm({ name: "", powerKW: "", durationHours: "" });
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">
          <Zap size={14} /> {t("scheduler_title", "Smart Appliance Scheduler")}
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-300)", margin: "0 0 18px", lineHeight: 1.5 }}>
          {t("scheduler_subtitle", "Optimize appliance usage to consume 100% free solar power.")}
        </p>

        <form onSubmit={addAppliance} noValidate style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
          <label className="sr-only" htmlFor="appliance-name">Appliance name</label>
          <input
            id="appliance-name"
            placeholder={t("select_appliance_label", "Appliance name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
          <label className="sr-only" htmlFor="appliance-power">Power in kilowatts</label>
          <input
            id="appliance-power"
            placeholder="Power (kW)"
            type="number"
            step="0.1"
            min="0"
            value={form.powerKW}
            onChange={(e) => setForm({ ...form, powerKW: e.target.value })}
            style={{ ...inputStyle, width: 110 }}
          />
          <label className="sr-only" htmlFor="appliance-duration">Duration in hours</label>
          <input
            id="appliance-duration"
            placeholder="Duration (hrs)"
            type="number"
            step="0.25"
            min="0"
            value={form.durationHours}
            onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
            style={{ ...inputStyle, width: 120 }}
          />
          <button type="submit" style={addBtnStyle}>
            <Plus size={15} /> {t("btn_send", "Add")}
          </button>
        </form>
        {formError && (
          <div role="alert" style={{ fontSize: 12, color: "#ff8a8a", marginTop: 6 }}>
            {formError}
          </div>
        )}
      </div>

      {initializing ? (
        <PanelSkeleton rows={3} />
      ) : recommendations.length === 0 ? (
        <EmptyState title="No appliances yet" message="Add one above to get a recommended solar window for it." />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {recommendations.map((a) => (
            <div key={a.id} className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                  {a.powerKW} kW &middot; {a.durationHours} hr run
                </div>
              </div>
              <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} aria-hidden="true" /> {t("recommended_window_title", "Recommended window")}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--saffron)" }}>
                    {a.recommendation.window}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)", display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingDown size={12} aria-hidden="true" /> {t("savings_calculated", "Grid reduction")}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--india-green)" }}>
                    {a.recommendation.reductionKWh} kWh
                  </div>
                </div>
              </div>
              {a.recommendation.explanation && (
                <div
                  style={{
                    flexBasis: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--ink-300)",
                    borderTop: "1px solid var(--hairline)",
                    paddingTop: 10,
                    marginTop: 2,
                  }}
                >
                  <Sparkles size={12} color="var(--saffron)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <span>
                    {a.recommendation.explanation}
                    {a.recommendation.source && (
                      <span style={{ marginLeft: 6, fontSize: 10.5, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        · {a.recommendation.source}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  flex: "1 1 160px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--hairline)",
  borderRadius: 9,
  padding: "9px 12px",
  color: "var(--ink-100)",
  fontSize: 13,
  outline: "none",
};

const addBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "linear-gradient(135deg, var(--saffron), var(--saffron-deep))",
  border: "none",
  borderRadius: 9,
  padding: "9px 16px",
  color: "#0A1626",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};
