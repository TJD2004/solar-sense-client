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
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
        drawerOpen
          ? "bg-amber-50 text-amber-600 border-amber-300 shadow-xs"
          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
      }`}
    >
      <Bell className="w-4 h-4 stroke-[2.2]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse font-mono-num">
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
        return <AlertOctagon className="w-4 h-4 text-rose-600 stroke-[2.2]" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 stroke-[2.2]" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 stroke-[2.2]" />;
    }
  };

  return (
    <>
      {/* Opaque Dimmed Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[999] transition-opacity"
      />

      {/* 100% Solid Opaque White Drawer Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white border-l border-slate-200 shadow-2xl z-[1000] flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm font-display">
                {t("notif_title", "System Alerts & Log")}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {unreadCount > 0 ? `${unreadCount} ${t("notif_unread", "unread notifications")}` : t("notif_all_read", "All clear")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Chips & Action Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap bg-slate-50/80">
          <div className="flex items-center gap-1.5">
            {["all", "critical", "warning", "info"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {t(`filter_${f}`, f)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title={t("btn_mark_all_read", "Mark all read")}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                title={t("btn_clear_all", "Clear all")}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List (100% Opaque Solid Cards) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              {t("notif_empty", "No alerts recorded.")}
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const displayTitle = n.titleKey ? t(n.titleKey, n.titleFallback) : n.title;
              let displayMessage = n.messageKey ? t(n.messageKey, n.messageFallback) : n.message;

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
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.read
                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                      : "bg-amber-50 border-amber-200/90 text-slate-900 shadow-xs hover:bg-amber-100/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-extrabold text-xs text-slate-900 font-display truncate">
                          {displayTitle}
                        </h4>
                        <span className="font-mono-num text-[10px] font-semibold text-slate-500 shrink-0">
                          {formatNotifTime(n.ts)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {displayMessage}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
