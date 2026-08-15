import React from "react";
import { Sun, Globe } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function TopBar() {
  const { connection } = useSimulation();
  const { language, setLanguage, languages, t } = useLanguage();

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

      {/* Connection Status Badge & Language Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Language Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.04)", padding: "4px 10px", borderRadius: 8, border: "1px solid var(--hairline)" }}>
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
              <option key={lang.code} value={lang.code} style={{ background: "#0D1B2A", color: "#FFFFFF" }}>
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
