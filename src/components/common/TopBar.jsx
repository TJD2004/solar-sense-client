import React, { useState, useEffect } from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function TopBar() {
  const { connection } = useSimulation();
  const { language, setLanguage, languages, t } = useLanguage();

  const [theme, setTheme] = useState(() => localStorage.getItem("solarsense_theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("solarsense_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const CONNECTION_LABEL = {
    standalone: t("conn_standalone", "SIMULATED"),
    connecting: t("conn_reconnecting", "CONNECTING"),
    live: t("conn_live", "LIVE DIGITAL TWIN"),
    reconnecting: t("conn_reconnecting", "RECONNECTING"),
    fallback: t("conn_fallback", "LOCAL FALLBACK"),
  };

  const CONNECTION_COLOR = {
    standalone: "var(--ink-500)",
    connecting: "var(--saffron)",
    live: "var(--india-green)",
    reconnecting: "var(--saffron-deep)",
    fallback: "var(--ink-500)",
  };

  const label = CONNECTION_LABEL[connection] || CONNECTION_LABEL.live;
  const color = CONNECTION_COLOR[connection] || "var(--india-green)";
  const pulsing = connection === "live" || connection === "connecting" || connection === "reconnecting";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
      {/* Brand & Tagline */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, var(--saffron), var(--india-green))",
          }}
        >
          <Sun size={19} color="#0A1626" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em" }}>
            {t("brand", "SolarSense")}
          </div>
          <div className="ss-tricolor" />
        </div>
      </div>

      {/* Connection Status Badge, Theme Toggle & Language Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? t("theme_light", "Switch to Light Theme") : t("theme_dark", "Switch to Dark Theme")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: theme === "light" ? "rgba(234, 88, 12, 0.12)" : "rgba(255, 255, 255, 0.04)",
            padding: "5px 11px",
            borderRadius: 8,
            border: "1px solid var(--hairline)",
            color: theme === "light" ? "var(--saffron)" : "var(--ink-100)",
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {theme === "dark" ? <Sun size={15} color="var(--saffron)" /> : <Moon size={15} color="var(--saffron)" />}
          <span>{theme === "dark" ? t("light_mode", "Light Mode") : t("dark_mode", "Dark Mode")}</span>
        </button>

        {/* Language Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: theme === "light" ? "#f1f5f9" : "rgba(255, 255, 255, 0.04)", padding: "4px 10px", borderRadius: 8, border: "1px solid var(--hairline)" }}>
          <Globe size={15} color="var(--chakra-blue-light)" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: "transparent",
              color: "var(--ink-100)",
              border: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} style={{ background: theme === "light" ? "#FFFFFF" : "#0D1B2A", color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 12,
            color: "var(--ink-300)",
          }}
        >
          <span className="pulse-dot" style={pulsing ? { background: color } : { background: color, animation: "none", boxShadow: "none" }} />
          <span style={{ color, letterSpacing: "0.04em" }}>{label}</span>
        </div>
      </div>
    </div>
  );
}
