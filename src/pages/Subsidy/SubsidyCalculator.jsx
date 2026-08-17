import React, { useState, useMemo } from "react";
import { Landmark, Calculator, Zap, ShieldCheck, IndianRupee, Sun, ExternalLink, Info, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function SubsidyCalculator() {
  const { t } = useLanguage();

  const [capacityKW, setCapacityKW] = useState(3);
  const [monthlyBill, setMonthlyBill] = useState(2500);
  const [roofArea, setRoofArea] = useState(350);
  const [category, setCategory] = useState("residential");

  const calculations = useMemo(() => {
    const costPerKW = 50000;
    const totalCost = capacityKW * costPerKW;

    let subsidy = 0;
    if (category === "residential") {
      if (capacityKW <= 2) {
        subsidy = capacityKW * 30000;
      } else {
        subsidy = 60000 + 18000;
      }
    } else {
      subsidy = capacityKW * 18000;
    }

    const netCost = Math.max(0, totalCost - subsidy);
    const annualGenerationKWh = capacityKW * 1400;
    const monthlyGenerationKWh = Math.round(annualGenerationKWh / 12);
    const tariffPerUnit = 7.5;
    const annualSavingsINR = Math.round(annualGenerationKWh * tariffPerUnit);
    const monthlySavingsINR = Math.round(annualSavingsINR / 12);
    const paybackYears = annualSavingsINR > 0 ? (netCost / annualSavingsINR).toFixed(1) : 0;
    const roofAreaRequired = capacityKW * 100;
    const roofSufficient = roofArea >= roofAreaRequired;
    const recommendedKW = Math.max(1, Math.min(10, Math.ceil(monthlyBill / 1100)));

    return {
      totalCost,
      subsidy,
      netCost,
      monthlyGenerationKWh,
      annualGenerationKWh,
      monthlySavingsINR,
      annualSavingsINR,
      paybackYears,
      roofAreaRequired,
      roofSufficient,
      recommendedKW,
    };
  }, [capacityKW, category, monthlyBill, roofArea]);

  const SCHEME_STEPS = [
    { step: 1, title: t("step1_title", "Portal Registration"), desc: t("step1_desc", "Register on PM Surya Ghar portal with DISCOM consumer number.") },
    { step: 2, title: t("step2_title", "Feasibility Approval"), desc: t("step2_desc", "DISCOM approves technical rooftop solar feasibility.") },
    { step: 3, title: t("step3_title", "Vendor Installation"), desc: t("step3_desc", "Registered vendor installs ALMM certified solar panels & inverter.") },
    { step: 4, title: t("step4_title", "Net Metering & Subsidy"), desc: t("step4_desc", "Net meter installed; direct subsidy credited to bank account.") },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 mb-2">
              <Landmark className="w-3.5 h-3.5 text-amber-600" />
              <span>{t("scheme_tag", "GOVT OF INDIA SCHEME")}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
              {t("subsidy_hero_title", "PM Surya Ghar: Muft Bijli Yojana Subsidy Calculator")}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t("subsidy_hero_desc", "Calculate government financial assistance, net installation cost, monthly electricity unit savings, and payback period.")}
            </p>
          </div>

          <a
            href="https://pmsuryaghar.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            <span>{t("btn_apply_portal", "Official Govt Portal")}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Step-by-Step Scheme Progress Tracker */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-display mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t("subsidy_tracker_title", "Step-by-Step Subsidy Disbursement Process Tracker")}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCHEME_STEPS.map((s, idx) => (
            <div key={s.step} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 relative">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono-num mb-2">
                0{s.step}
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-display">{s.title}</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{s.desc}</p>
              {idx < 3 && <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 z-10" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs Column */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide font-display">
            <Calculator className="w-4 h-4 text-amber-500" />
            <span>{t("rooftop_inputs_title", "Rooftop System Inputs")}</span>
          </div>

          {/* System Capacity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">{t("label_capacity", "System Capacity:")}</span>
              <span className="font-mono-num font-bold text-blue-600 text-base">{capacityKW} kW</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={capacityKW}
              onChange={(e) => setCapacityKW(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{t("capacity_1kw", "1 kW (Small Home)")}</span>
              <span>{t("capacity_3kw", "3 kW (Recommended)")}</span>
              <span>{t("capacity_10kw", "10 kW (Large)")}</span>
            </div>
          </div>

          {/* Monthly Bill Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {t("label_monthly_bill", "Average Monthly Electricity Bill (₹):")}
            </label>
            <input
              type="number"
              min={500}
              max={50000}
              step={500}
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-num text-slate-900 focus:bg-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Rooftop Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {t("label_roof_area", "Shadow-Free Rooftop Area (sq. ft.):")}
            </label>
            <input
              type="number"
              min={50}
              max={5000}
              step={50}
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-num text-slate-900 focus:bg-white outline-none focus:border-blue-500"
            />
            <div className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("roof_area_required_lbl", "Required:")} {calculations.roofAreaRequired} sq ft ({calculations.roofSufficient ? t("roof_area_sufficient", "Area is sufficient ✅") : t("roof_area_insufficient", "Insufficient space ⚠️")})</span>
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">{t("label_category", "Applicant Category:")}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory("residential")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  category === "residential" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {t("category_residential", "Residential Rooftop")}
              </button>
              <button
                type="button"
                onClick={() => setCategory("ghs")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  category === "ghs" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {t("category_ghs", "GHS / RWA Society")}
              </button>
            </div>
          </div>

        </div>

        {/* Results & ROI Payback Breakdown Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top 3 Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
              <div className="text-xs text-slate-500 font-semibold mb-1">{t("estimated_cost_lbl", "Estimated Cost")}</div>
              <div className="text-xl font-bold font-mono-num text-slate-900">₹{calculations.totalCost.toLocaleString("en-IN")}</div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-emerald-800 font-bold mb-1">{t("gov_subsidy_credit_lbl", "Govt Subsidy Credit")}</div>
              <div className="text-xl font-bold font-mono-num text-emerald-700">₹{calculations.subsidy.toLocaleString("en-IN")}</div>
            </div>

            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-sky-800 font-bold mb-1">{t("net_investment_lbl", "Net Investment")}</div>
              <div className="text-xl font-bold font-mono-num text-sky-700">₹{calculations.netCost.toLocaleString("en-IN")}</div>
            </div>
          </div>

          {/* Detailed ROI Breakdown */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide font-display">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{t("roi_matrix_title", "ROI Payback & Financial Yield Matrix")}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-xs text-slate-500 font-medium mb-1">{t("monthly_gen_lbl", "Monthly Gen")}</div>
                <div className="text-base font-bold font-mono-num text-slate-900">{calculations.monthlyGenerationKWh} <span className="text-xs font-sans">kWh</span></div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-xs text-slate-500 font-medium mb-1">{t("monthly_savings_lbl", "Monthly Savings")}</div>
                <div className="text-base font-bold font-mono-num text-emerald-700">₹{calculations.monthlySavingsINR.toLocaleString("en-IN")}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-xs text-slate-500 font-medium mb-1">{t("payback_period_lbl", "Payback Period")}</div>
                <div className="text-base font-bold font-mono-num text-amber-600">{calculations.paybackYears} <span className="text-xs font-sans">{t("years_unit", "Years")}</span></div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-xs text-slate-500 font-medium mb-1">{t("annual_savings_lbl", "Annual Savings")}</div>
                <div className="text-base font-bold font-mono-num text-sky-700">₹{calculations.annualSavingsINR.toLocaleString("en-IN")}</div>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {t(
                  "subsidy_summary_advisory",
                  "Under the PM Surya Ghar scheme, your {capacity} kW system investment will be fully recovered in {payback} years, saving ₹{savings} annually for 25+ years!"
                )
                  .replace("{capacity}", capacityKW)
                  .replace("{payback}", calculations.paybackYears)
                  .replace("{savings}", calculations.annualSavingsINR.toLocaleString("en-IN"))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

