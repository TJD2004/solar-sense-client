import React from "react";
import { Leaf, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function ImpactCards() {
  const { monthly, scenario } = useSimulation();
  const { t } = useLanguage();
  const isUp = scenario.id === "normal";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="panel mini-panel">
        <div>
          <div className="mini-label">{t("estimated_savings", "This Month's Savings")}</div>
          <div className="mini-value">₹{monthly.savings.toLocaleString("en-IN")}</div>
          <div className="mini-sub" style={{ color: isUp ? "var(--india-green)" : "var(--saffron-deep)" }}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {monthly.monthGeneratedKWh} {t("kwh_unit", "kWh")}
          </div>
        </div>
        <Leaf size={26} color="var(--india-green)" strokeWidth={1.8} />
      </div>
      <div className="panel mini-panel">
        <div>
          <div className="mini-label">{t("co2_avoided", "CO₂ Avoided")}</div>
          <div className="mini-value">{monthly.co2AvoidedKg} {t("kg_unit", "kg")}</div>
          <div className="mini-sub" style={{ color: "var(--chakra-blue-light)" }}>
            ≈ {monthly.treesPerYear} {t("trees_unit", "trees / year")}
          </div>
        </div>
        <Leaf size={26} color="var(--chakra-blue-light)" strokeWidth={1.8} />
      </div>
    </div>
  );
}
