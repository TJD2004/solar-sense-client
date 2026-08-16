import React, { useState, useMemo } from "react";
import { Landmark, Calculator, Zap, ShieldCheck, IndianRupee, Sun, ArrowRight, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import StatTile from "../../components/common/StatTile.jsx";

export default function SubsidyCalculator() {
  const { t } = useLanguage();

  // Inputs
  const [capacityKW, setCapacityKW] = useState(3); // 1 to 10 kW
  const [monthlyBill, setMonthlyBill] = useState(2500); // INR
  const [roofArea, setRoofArea] = useState(350); // sq ft
  const [category, setCategory] = useState("residential"); // "residential" | "ghs"

  // Calculation Logic according to PM Surya Ghar: Muft Bijli Yojana Scheme
  // Official Subsidy Rates for Residential:
  // - 1 kW to 2 kW: Rs. 30,000 per kW (Max Rs. 60,000)
  // - 3 kW: Rs. 78,000 total (Rs. 60k for 1-2kW + Rs. 18k for 3rd kW)
  // - > 3 kW up to 10 kW: Fixed cap of Rs. 78,000
  // Benchmark cost: ~Rs. 50,000 per kW
  const calculations = useMemo(() => {
    const costPerKW = 50000; // Rs 50,000 / kW benchmark
    const totalCost = capacityKW * costPerKW;

    let subsidy = 0;
    if (category === "residential") {
      if (capacityKW <= 2) {
        subsidy = capacityKW * 30000;
      } else {
        subsidy = 60000 + 18000; // Capped at Rs 78,000 for 3 kW and above
      }
    } else {
      // Group Housing Societies (GHS/RWA) - Rs 18,000 per kW up to 500 kW
      subsidy = capacityKW * 18000;
    }

    const netCost = Math.max(0, totalCost - subsidy);

    // Generation Estimates: ~1,400 units (kWh) per kW per year
    const annualGenerationKWh = capacityKW * 1400;
    const monthlyGenerationKWh = Math.round(annualGenerationKWh / 12);

    // Savings Estimate: Average Rs 7.50 per unit electricity tariff
    const tariffPerUnit = 7.5;
    const annualSavingsINR = Math.round(annualGenerationKWh * tariffPerUnit);
    const monthlySavingsINR = Math.round(annualSavingsINR / 12);

    // Payback Period (Years)
    const paybackYears = annualSavingsINR > 0 ? (netCost / annualSavingsINR).toFixed(1) : 0;

    // Roof Area Required: ~100 sq ft per 1 kW
    const roofAreaRequired = capacityKW * 100;
    const roofSufficient = roofArea >= roofAreaRequired;

    // Capacity Recommendation from Monthly Bill
    // Approx 1 kW required for every Rs 1,000 - Rs 1,200 monthly bill
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

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Hero Header Banner */}
      <div
        className="panel"
        style={{
          background: "linear-gradient(135deg, rgba(255, 153, 51, 0.12), rgba(31, 174, 92, 0.1))",
          borderColor: "rgba(255, 153, 51, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255, 153, 51, 0.15)", padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "var(--saffron)", marginBottom: 10 }}>
              <Landmark size={13} /> {t("scheme_tag", "GOVT OF INDIA SCHEME")}
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--ink-100)" }}>
              {t("subsidy_hero_title", "PM Surya Ghar: Muft Bijli Yojana Subsidy Calculator")}
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-300)", lineHeight: 1.5, margin: 0 }}>
              {t("subsidy_hero_desc", "Calculate government financial assistance, net installation cost, monthly electricity unit savings, and payback period under the official PM Surya Ghar Solar Rooftop Scheme.")}
            </p>
          </div>

          <a
            href="https://pmsuryaghar.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="ss-chip"
            style={{
              background: "var(--saffron)",
              color: "#ffffff",
              border: "none",
              padding: "10px 16px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
            }}
          >
            <span>{t("btn_apply_portal", "Official Portal")}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Main Interactive Calculator Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 20 }}>
        {/* Controls Column */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="panel-title">
            <Calculator size={14} /> {t("calc_inputs_title", "1. System & Rooftop Specifications")}
          </div>

          {/* System Capacity Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-100)" }}>
                {t("label_capacity", "Solar System Capacity:")}
              </label>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "var(--saffron)", fontSize: 15 }}>
                {capacityKW} kW
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={capacityKW}
              onChange={(e) => setCapacityKW(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--saffron)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-500)", marginTop: 4 }}>
              <span>1 kW ({t("small_home", "Small Home")})</span>
              <span>3 kW ({t("recommended", "Recommended")})</span>
              <span>10 kW ({t("large", "Large")})</span>
            </div>
          </div>

          {/* Monthly Electricity Bill Input */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-100)", marginBottom: 6 }}>
              {t("label_monthly_bill", "Average Monthly Electricity Bill (₹):")}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min={500}
                max={50000}
                step={500}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                style={{
                  width: "100%",
                  background: "var(--navy-panel-2)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "var(--ink-100)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
            {calculations.recommendedKW !== capacityKW && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--india-green)", marginTop: 6 }}>
                <Info size={13} />
                <span>
                  {t("bill_rec_hint", "Based on your bill, a")} <strong>{calculations.recommendedKW} kW</strong> {t("bill_rec_suffix", "system is recommended.")}
                  <button
                    type="button"
                    onClick={() => setCapacityKW(calculations.recommendedKW)}
                    style={{ background: "none", border: "none", color: "var(--saffron)", cursor: "pointer", textDecoration: "underline", marginLeft: 6 }}
                  >
                    {t("btn_set_kw", "Set {val} kW").replace("{val}", calculations.recommendedKW)}
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Available Roof Area (sq ft) */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-100)", marginBottom: 6 }}>
              {t("label_roof_area", "Available Shadow-Free Rooftop Area (sq. ft.):")}
            </label>
            <input
              type="number"
              min={50}
              max={5000}
              step={50}
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              style={{
                width: "100%",
                background: "var(--navy-panel-2)",
                border: "1px solid var(--hairline)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "var(--ink-100)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                outline: "none",
              }}
            />
            <div style={{ fontSize: 11, color: calculations.roofSufficient ? "var(--india-green)" : "#ef4444", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={13} />
              <span>
                {t("required", "Required:")} <strong>{calculations.roofAreaRequired} sq ft</strong> ({calculations.roofSufficient ? t("area_sufficient", "Area is sufficient ✅") : t("insufficient_space", "Insufficient space ⚠️")})
              </span>
            </div>
          </div>

          {/* Scheme Category */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-100)", marginBottom: 6 }}>
              {t("label_category", "Applicant Category:")}
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setCategory("residential")}
                className="ss-chip"
                data-active={category === "residential" || undefined}
                style={{ flex: 1, justifyContent: "center", padding: "8px 12px" }}
              >
                {t("residential_rooftop", "Residential Rooftop")}
              </button>
              <button
                type="button"
                onClick={() => setCategory("ghs")}
                className="ss-chip"
                data-active={category === "ghs" || undefined}
                style={{ flex: 1, justifyContent: "center", padding: "8px 12px" }}
              >
                {t("ghs_rwa_society", "GHS / RWA Society")}
              </button>
            </div>
          </div>
        </div>

        {/* Financial Results & Breakdown Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Top 3 Result Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div className="panel" style={{ padding: 14, background: "rgba(255, 153, 51, 0.08)", borderColor: "rgba(255, 153, 51, 0.3)" }}>
              <div style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 4 }}>{t("estimated_total_cost", "Estimated Total Cost")}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 18, color: "var(--ink-100)" }}>
                ₹{calculations.totalCost.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="panel" style={{ padding: 14, background: "rgba(31, 174, 92, 0.1)", borderColor: "rgba(31, 174, 92, 0.4)" }}>
              <div style={{ fontSize: 11, color: "var(--india-green)", fontWeight: 600, marginBottom: 4 }}>{t("govt_subsidy_lbl", "Govt. Subsidy (Muft Bijli)")}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 18, color: "var(--india-green)" }}>
                ₹{calculations.subsidy.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="panel" style={{ padding: 14, background: "rgba(18, 58, 107, 0.15)", borderColor: "var(--hairline)" }}>
              <div style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 4 }}>{t("net_out_of_pocket", "Net Out-of-Pocket Cost")}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 18, color: "var(--chakra-blue-light)" }}>
                ₹{calculations.netCost.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Breakdown & Payback Panel */}
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="panel-title">
              <Zap size={14} /> {t("subsidy_breakdown_title", "2. Cost & Energy Generation Breakdown")}
            </div>

            {/* Progress Bar Visualization */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span>{t("govt_subsidy", "Govt Subsidy:")} <strong>{Math.round((calculations.subsidy / calculations.totalCost) * 100)}%</strong></span>
                <span>{t("you_pay", "You Pay:")} <strong>{Math.round((calculations.netCost / calculations.totalCost) * 100)}%</strong></span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "var(--hairline)", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${(calculations.subsidy / calculations.totalCost) * 100}%`, background: "var(--india-green)", transition: "width 0.4s ease" }} />
                <div style={{ width: `${(calculations.netCost / calculations.totalCost) * 100}%`, background: "var(--saffron)", transition: "width 0.4s ease" }} />
              </div>
            </div>

            {/* Key Performance Metrics List */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
              <div className="stat-tile">
                <div className="stat-icon" style={{ background: "rgba(255, 153, 51, 0.15)" }}>
                  <Sun size={18} color="var(--saffron)" />
                </div>
                <div>
                  <div className="stat-value">{calculations.monthlyGenerationKWh} <span className="stat-unit">{t("kwh_mo_unit", "kWh/mo")}</span></div>
                  <div className="stat-label">{t("est_monthly_gen", "Est. Monthly Generation")}</div>
                </div>
              </div>

              <div className="stat-tile">
                <div className="stat-icon" style={{ background: "rgba(31, 174, 92, 0.15)" }}>
                  <IndianRupee size={18} color="var(--india-green)" />
                </div>
                <div>
                  <div className="stat-value">₹{calculations.monthlySavingsINR.toLocaleString("en-IN")} <span className="stat-unit">{t("per_mo_unit", "/mo")}</span></div>
                  <div className="stat-label">{t("est_monthly_savings", "Est. Monthly Bill Savings")}</div>
                </div>
              </div>

              <div className="stat-tile">
                <div className="stat-icon" style={{ background: "rgba(91, 156, 232, 0.15)" }}>
                  <ShieldCheck size={18} color="var(--chakra-blue-light)" />
                </div>
                <div>
                  <div className="stat-value">{calculations.paybackYears} <span className="stat-unit">{t("years_unit", "Years")}</span></div>
                  <div className="stat-label">{t("payback_period", "Payback Period")}</div>
                </div>
              </div>

              <div className="stat-tile">
                <div className="stat-icon" style={{ background: "rgba(255, 122, 26, 0.15)" }}>
                  <Zap size={18} color="var(--saffron-deep)" />
                </div>
                <div>
                  <div className="stat-value">₹{calculations.annualSavingsINR.toLocaleString("en-IN")} <span className="stat-unit">{t("per_yr_unit", "/yr")}</span></div>
                  <div className="stat-label">{t("est_annual_savings", "Est. Annual Financial Savings")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Explanation Callout Box */}
          <div
            className="panel"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--hairline)",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--saffron)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={14} /> {t("ai_subsidy_summary_title", "AI Subsidy Summary")}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-300)", lineHeight: 1.5, margin: 0 }}>
              {t("ai_subsidy_summary_desc", "Under the PM Surya Ghar scheme, a {capacity} kW solar system costs approx ₹{cost}. With your ₹{subsidy} direct subsidy credit, your net investment is reduced to ₹{netCost}. You will generate roughly {gen} units of free solar electricity every year, recovering your full investment in just {payback} years!")
                .replace("{capacity}", capacityKW)
                .replace("{cost}", calculations.totalCost.toLocaleString("en-IN"))
                .replace("{subsidy}", calculations.subsidy.toLocaleString("en-IN"))
                .replace("{netCost}", calculations.netCost.toLocaleString("en-IN"))
                .replace("{gen}", calculations.annualGenerationKWh.toLocaleString("en-IN"))
                .replace("{payback}", calculations.paybackYears)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
