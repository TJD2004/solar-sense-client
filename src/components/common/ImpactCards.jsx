import React from "react";
import { Leaf, ArrowUpRight, ArrowDownRight, IndianRupee, TreeDeciduous } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function ImpactCards() {
  const { monthly, scenario } = useSimulation();
  const { t } = useLanguage();
  const isUp = scenario.id === "normal";

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Monthly Financial Savings Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex items-center justify-between flex-1">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">
            {t("estimated_savings", "Monthly Energy Savings")}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-num">
            ₹{monthly.savings.toLocaleString("en-IN")}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold font-mono-num ${isUp ? "text-emerald-600" : "text-amber-600"}`}>
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{monthly.monthGeneratedKWh} {t("kwh_unit", "kWh Generated")}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <IndianRupee className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>

      {/* Environmental CO2 Avoided Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex items-center justify-between flex-1">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">
            {t("co2_avoided", "CO₂ Carbon Offset")}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-num">
            {monthly.co2AvoidedKg} <span className="text-sm font-sans font-semibold text-slate-500">{t("kg_unit", "kg")}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-sky-600 font-mono-num">
            <TreeDeciduous className="w-3.5 h-3.5" />
            <span>≈ {monthly.treesPerYear} {t("trees_unit", "Trees Planted Equiv.")}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
          <Leaf className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
}

