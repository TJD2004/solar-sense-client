import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BarChart3, CloudSun, CalendarClock, Landmark, SlidersHorizontal, MessageSquareCode } from "lucide-react";
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
    { to: "/copilot", label: t("nav_copilot", "AI Copilot"), icon: MessageSquareCode },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-2">

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"

              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}


