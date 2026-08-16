import React from "react";
import { Sun, Globe } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { NotificationBell } from "./NotificationDrawer.jsx";

export default function TopBar() {
  const { connection } = useSimulation();
  const { language, setLanguage, languages, t } = useLanguage();

  const CONNECTION_LABEL = {
    standalone: t("conn_standalone", "SIMULATED TWIN"),
    connecting: t("conn_reconnecting", "CONNECTING..."),
    live: t("conn_live", "LIVE DIGITAL TWIN"),
    reconnecting: t("conn_reconnecting", "RECONNECTING"),
    fallback: t("conn_fallback", "LOCAL FALLBACK"),
  };

  const label = CONNECTION_LABEL[connection] || CONNECTION_LABEL.live;
  const isLive = connection === "live" || connection === "connecting" || connection === "reconnecting";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-14 flex items-center justify-between border-b border-slate-100">

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
          <Sun className="w-4.5 h-4.5 stroke-[2.5]" />
        </div>
        <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
          SolarSense<span className="text-amber-500">.AI</span>
        </span>
      </div>

      {/* Action Controls & Status */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-800 font-semibold cursor-pointer outline-none text-xs"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Digital Twin Status Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-full px-2.5 py-0.5 text-xs font-mono-num font-bold text-emerald-700">
          <span className={isLive ? "pulse-dot-green" : "w-1.5 h-1.5 rounded-full bg-emerald-600"} />
          <span className="tracking-wide uppercase text-[10px] text-emerald-700">{label}</span>
        </div>
      </div>
    </div>
  );
}


