import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BarChart3, CloudSun, CalendarClock, Landmark, SlidersHorizontal, MessageCircle } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function NavTabs() {
  const { t } = useLanguage();

  const TABS = [
    { to: "/dashboard", label: t("nav_dashboard", "Dashboard"), icon: LayoutDashboard },
    { to: "/analytics", label: t("nav_analytics", "Analytics"), icon: BarChart3 },
    { to: "/forecast", label: t("nav_forecast", "Forecast"), icon: CloudSun },
    { to: "/scheduler", label: t("nav_scheduler", "AI Scheduler"), icon: CalendarClock },
    { to: "/subsidy", label: t("nav_subsidy", "Govt Subsidy"), icon: Landmark },
    { to: "/simulator", label: t("nav_simulator", "Control Room"), icon: SlidersHorizontal },
    { to: "/copilot", label: t("nav_copilot", "AI Copilot"), icon: MessageCircle },
  ];

  return (
    <nav aria-label="Main" style={{ display: "flex", gap: 4, marginBottom: 22, borderBottom: "1px solid var(--hairline)", paddingBottom: 2, flexWrap: "wrap" }}>
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `ss-navlink${isActive ? " active" : ""}`}>
          <Icon size={15} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
