import React, { useState } from "react";
import { Bell, X, CheckCheck, Trash2, AlertTriangle, Info, AlertOctagon, ShieldAlert } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function formatNotifTime(d) {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  return dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function NotificationBell() {
  const { unreadCount, drawerOpen, setDrawerOpen } = useNotifications();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(!drawerOpen)}
      aria-label={t("notif_bell_tooltip", "Real-Time Alerts & Notifications")}
      title={t("notif_bell_tooltip", "Real-Time Alerts & Notifications")}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 8,
        background: drawerOpen ? "rgba(234, 88, 12, 0.15)" : "var(--navy-panel-2, rgba(255,255,255,0.04))",
        border: "1px solid var(--hairline)",
        color: drawerOpen ? "var(--saffron)" : "var(--ink-100)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <Bell size={16} />
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "var(--saffron-deep, #ff7a1a)",
            color: "#ffffff",
            fontSize: 10,
            fontWeight: 700,
            width: 17,
            height: 17,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 8px rgba(255, 122, 26, 0.6)",
            animation: "pulseDot 1.5s infinite",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export default function NotificationDrawer() {
  const { notifications, unreadCount, drawerOpen, setDrawerOpen, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all"); // "all" | "critical" | "warning" | "info"

  if (!drawerOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case "critical":
        return <AlertOctagon size={16} color="#ef4444" />;
      case "warning":
        return <AlertTriangle size={16} color="var(--saffron)" />;
      default:
        return <Info size={16} color="var(--chakra-blue-light)" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(3px)",
          zIndex: 999,
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 380,
          background: "var(--navy-bg)",
          borderLeft: "1px solid var(--hairline)",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          animation: "drawerSlide 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--navy-panel)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={18} color="var(--saffron)" />
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>
                {t("notif_title", "System Alerts & Log")}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>
                {unreadCount > 0 ? `${unreadCount} ${t("notif_unread", "unread notifications")}` : t("notif_all_read", "All clear")}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="ss-btn-ghost"
            style={{ padding: 6, borderRadius: "50%" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Chips & Action Bar */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
            background: "var(--navy-panel-2)",
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "critical", "warning", "info"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="ss-chip"
                data-active={filter === f || undefined}
                style={{ padding: "4px 9px", fontSize: 11, textTransform: "capitalize" }}
              >
                {t(`filter_${f}`, f)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title={t("btn_mark_all_read", "Mark all read")}
                className="ss-btn-ghost"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                <CheckCheck size={13} />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                title={t("btn_clear_all", "Clear all")}
                className="ss-btn-ghost"
                style={{ padding: "4px 8px", fontSize: 11, color: "#ff7a1a" }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-500)", fontSize: 13 }}>
              {t("notif_empty", "No alerts recorded.")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredNotifs.map((n) => {
                // Resolve title and message dynamically using t()
                const displayTitle = n.titleKey ? t(n.titleKey, n.titleFallback) : n.title;
                let displayMessage = n.messageKey ? t(n.messageKey, n.messageFallback) : n.message;

                // Handle string replacement parameters if arguments exist
                if (n.messageArgs) {
                  const resolvedArgs = { ...n.messageArgs };
                  if (n.messageArgs.scenarioId) {
                    resolvedArgs.scenario = t("scenario_" + n.messageArgs.scenarioId, n.messageArgs.scenarioFallback || n.messageArgs.label);
                  }
                  if (n.messageArgs.desc && n.messageArgs.scenarioId) {
                    resolvedArgs.desc = t(n.messageArgs.scenarioId + "_desc", n.messageArgs.desc);
                  }
                  if (n.messageArgs.label && n.messageArgs.scenarioId) {
                    resolvedArgs.label = t("scenario_" + n.messageArgs.scenarioId, n.messageArgs.label);
                  }

                  Object.entries(resolvedArgs).forEach(([key, val]) => {
                    displayMessage = displayMessage.replace(new RegExp(`\\{${key}\\}`, "g"), val);
                  });
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: n.read ? "var(--navy-panel)" : "rgba(255, 153, 51, 0.08)",
                      border: n.read ? "1px solid var(--hairline)" : "1px solid rgba(255, 153, 51, 0.3)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ marginTop: 2 }}>{getIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-100)" }}>{displayTitle}</div>
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 10,
                              color: "var(--ink-500)",
                            }}
                          >
                            {formatNotifTime(n.ts)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-300)", lineHeight: 1.4 }}>{displayMessage}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
