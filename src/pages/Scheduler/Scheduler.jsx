import React, { useEffect, useState, useMemo } from "react";
import { Plus, Clock, TrendingDown, Sparkles, MoveHorizontal, CalendarClock, Trash2 } from "lucide-react";
import { recommendWindow } from "../../services/simulator.js";
import { callOrFallback, getScheduleRecommendation } from "../../services/api.js";
import { EmptyState, PanelSkeleton } from "../../components/common/AsyncState.jsx";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

const HOURS_TIMELINE = [
  { label: "06:00", hour: 6 },
  { label: "08:00", hour: 8 },
  { label: "10:00", hour: 10 },
  { label: "12:00", hour: 12 },
  { label: "14:00", hour: 14 },
  { label: "16:00", hour: 16 },
  { label: "18:00", hour: 18 },
];

function calculateGanttPosition(windowStr, durationHours) {
  let startHour = 11;
  if (windowStr) {
    const cleaned = String(windowStr).replace(/[–—]/g, "-");
    if (cleaned.includes("-")) {
      const parts = cleaned.split("-");
      const startPart = parts[0].trim();
      const parsed = parseInt(startPart.split(":")[0], 10);
      if (!isNaN(parsed)) startHour = parsed;
    }
  }

  const clampedStart = Math.max(6, Math.min(17, startHour));
  const hourOffset = clampedStart - 6;
  const leftPct = (hourOffset / 12) * 100;
  const widthPct = Math.min(100 - leftPct, ((parseFloat(durationHours) || 1) / 12) * 100);

  return { leftPct: Math.max(0, leftPct), widthPct: Math.max(10, widthPct) };
}

export default function Scheduler() {
  const { curve, initializing } = useSimulation();
  const { t } = useLanguage();

  const initialAppliances = useMemo(
    () => [
      { id: 1, name: t("appliance_washing", "Washing Machine"), powerKW: 1.2, durationHours: 1.5, window: "10:00 - 11:30" },
      { id: 2, name: t("appliance_ac", "Air Conditioner"), powerKW: 2.0, durationHours: 2, window: "12:00 - 14:00" },
      { id: 3, name: t("appliance_ev", "EV Fast Charger"), powerKW: 3.3, durationHours: 3, window: "11:00 - 14:00" },
    ],
    [t]
  );

  const [appliances, setAppliances] = useState(initialAppliances);
  const [form, setForm] = useState({ name: "", powerKW: "", durationHours: "" });
  const [formError, setFormError] = useState("");
  const [recsById, setRecsById] = useState({});

  useEffect(() => {
    let cancelled = false;
    (appliances || []).forEach((a) => {
      if (!a) return;
      callOrFallback(
        () => getScheduleRecommendation({ name: a.name, powerKW: a.powerKW, durationHours: a.durationHours }),
        () => ({ ...recommendWindow(curve || [], a.durationHours || 1, a.powerKW || 1), source: "heuristic" })
      ).then((rec) => {
        if (!cancelled && rec) setRecsById((prev) => ({ ...prev, [a.id]: rec }));
      }).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [appliances, curve]);

  const recommendations = useMemo(() => {
    return (appliances || []).map((a) => {
      if (!a) return null;
      const fallbackRec = { window: a.window || "11:00 - 13:00", reductionKWh: 1.2, explanation: "Shift operation to peak sunny hours for maximum savings." };
      const rec = recsById[a.id] || (curve && curve.length > 0 ? recommendWindow(curve, a.durationHours || 1, a.powerKW || 1) : fallbackRec);
      const finalRec = rec && typeof rec === "object" ? rec : fallbackRec;
      return {
        ...a,
        recommendation: finalRec,
        window: finalRec?.window || a.window || "11:00 - 13:00",
      };
    }).filter(Boolean);
  }, [appliances, recsById, curve]);

  const totalScheduledKW = useMemo(() => {
    return (appliances || []).reduce((sum, a) => sum + (parseFloat(a?.powerKW) || 0), 0).toFixed(1);
  }, [appliances]);

  const totalSavedKWh = useMemo(() => {
    return (recommendations || []).reduce((sum, a) => sum + (parseFloat(a?.recommendation?.reductionKWh) || 0), 0).toFixed(1);
  }, [recommendations]);

  function addAppliance(e) {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Please enter an appliance name.");
    const power = parseFloat(form.powerKW);
    const duration = parseFloat(form.durationHours);
    if (!(power > 0)) return setFormError("Please enter a valid power rating.");
    if (!(duration > 0)) return setFormError("Please enter a valid operating duration.");

    setFormError("");
    setAppliances((prev) => [
      ...prev,
      { id: Date.now(), name: form.name.trim(), powerKW: power, durationHours: duration, window: "11:00 - 13:00" },
    ]);
    setForm({ name: "", powerKW: "", durationHours: "" });
  }

  function removeAppliance(id) {
    setAppliances((prev) => (prev || []).filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <CalendarClock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-display">Appliance Energy Scheduler</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Solar Optimized
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Run heavy home appliances during peak sunny hours to use 100% free solar energy and lower your monthly bill.
              </p>
            </div>
          </div>

          {/* Metric Summary */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-display">Total Power Load</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono-num">{totalScheduledKW} kW</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3.5 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-display">Estimated Daily Savings</div>
              <div className="text-sm font-extrabold text-emerald-700 font-mono-num">~{totalSavedKWh} kWh</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Timeline + Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 font-display">
              <MoveHorizontal className="w-4 h-4 text-amber-500" />
              <span>Daily Solar Schedule (06:00 to 18:00)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Peak Sun Hours</span>
            </div>
          </div>

          {/* Hours Axis */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
                {HOURS_TIMELINE.map((h) => (
                  <span key={h.label}>{h.label}</span>
                ))}
              </div>
            </div>

            {/* Scheduled Appliance Rows */}
            {initializing ? (
              <PanelSkeleton rows={3} />
            ) : recommendations.length === 0 ? (
              <EmptyState title="No appliances added yet" message="Add an appliance on the right to see its recommended solar running time." />
            ) : (
              <div className="space-y-4">
                {recommendations.map((a) => {
                  const { leftPct, widthPct } = calculateGanttPosition(a.window, a.durationHours);
                  return (
                    <div key={a.id} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm font-display">{a.name}</h4>
                          <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {a.powerKW} kW · {a.durationHours} hrs
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <div className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{a.window}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Saves {a.recommendation?.reductionKWh ?? 1.2} kWh</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAppliance(a.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove appliance"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Gantt Bar */}
                      <div className="h-8 bg-white rounded-lg border border-slate-200 relative overflow-hidden flex items-center">
                        <div className="absolute inset-0 grid grid-cols-6 border-slate-100 pointer-events-none">
                          <div className="border-r border-slate-100" />
                          <div className="border-r border-slate-100" />
                          <div className="border-r border-slate-100" />
                          <div className="border-r border-slate-100" />
                          <div className="border-r border-slate-100" />
                          <div className="border-r border-slate-100" />
                        </div>

                        <div
                          className="absolute h-6 rounded-md bg-gradient-to-r from-amber-500 to-emerald-500 text-white flex items-center justify-between px-3 text-[11px] font-semibold shadow-xs"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        >
                          <span className="truncate">{a.name}</span>
                          <span className="shrink-0 text-[10px] opacity-95">{a.window}</span>
                        </div>
                      </div>

                      {/* Explanation Note */}
                      {a.recommendation?.explanation && (
                        <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-amber-900">Recommended Time: </span>
                            <span>{a.recommendation.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4 h-fit">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 font-display">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Add New Appliance</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Enter appliance power rating and operating time to find the best low-cost running window.
          </p>

          <form onSubmit={addAppliance} noValidate className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Appliance Name</label>
              <input
                placeholder="e.g. Washing Machine, EV Charger"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Power (kW)</label>
                <input
                  placeholder="e.g. 1.5"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.powerKW}
                  onChange={(e) => setForm({ ...form, powerKW: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                <input
                  placeholder="e.g. 2.0"
                  type="number"
                  step="0.25"
                  min="0"
                  value={form.durationHours}
                  onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {formError && <div className="text-xs text-rose-600 font-semibold">{formError}</div>}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Calculate Best Time & Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
