import React from "react";
import { WifiOff, RefreshCw, Inbox } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export function Skeleton({ height = 16, width = "100%", radius = 6, style }) {
  return (
    <div
      className="ss-skeleton"
      style={{ height, width, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function PanelSkeleton({ rows = 3, title = true }) {
  return (
    <div className="panel" aria-busy="true" aria-live="polite">
      {title && <Skeleton height={12} width={140} style={{ marginBottom: 16 }} />}
      <div style={{ display: "grid", gap: 10 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={14} width={`${85 - i * 12}%`} />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ErrorState({ title, message, onRetry }) {
  const { t } = useLanguage();
  const displayTitle = title || t("err_reach_meter", "Couldn't reach the solar meter");
  const displayMessage =
    message || t("err_feed_unavailable", "The live feed is unavailable right now. This won't affect stored history.");

  return (
    <div className="panel" role="alert" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="insight-icon" style={{ background: "rgba(255,122,26,0.14)" }}>
        <WifiOff size={18} color="var(--saffron-deep)" />
      </div>
      <div style={{ flex: 1 }}>
        <div className="insight-title">{displayTitle}</div>
        <div className="insight-body">{displayMessage}</div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ss-btn-ghost" aria-label={t("btn_retry", "Retry")}>
          <RefreshCw size={14} /> {t("btn_retry", "Retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }) {
  const { t } = useLanguage();
  const displayTitle = title || t("empty_title", "Nothing here yet");
  const displayMessage = message || t("empty_msg", "Data will show up here once it's available.");

  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="insight-icon" style={{ background: "rgba(91,156,232,0.14)" }}>
        <Inbox size={18} color="var(--chakra-blue-light)" />
      </div>
      <div>
        <div className="insight-title">{displayTitle}</div>
        <div className="insight-body">{displayMessage}</div>
      </div>
    </div>
  );
}
