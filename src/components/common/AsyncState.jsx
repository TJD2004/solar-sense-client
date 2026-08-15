import React from "react";
import { WifiOff, RefreshCw, Inbox } from "lucide-react";

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

export function ErrorState({
  title = "Couldn't reach the solar meter",
  message = "The live feed is unavailable right now. This won't affect stored history.",
  onRetry,
}) {
  return (
    <div className="panel" role="alert" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="insight-icon" style={{ background: "rgba(255,122,26,0.14)" }}>
        <WifiOff size={18} color="var(--saffron-deep)" />
      </div>
      <div style={{ flex: 1 }}>
        <div className="insight-title">{title}</div>
        <div className="insight-body">{message}</div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ss-btn-ghost" aria-label="Retry connecting to the solar meter">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "Data will show up here once it's available." }) {
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="insight-icon" style={{ background: "rgba(91,156,232,0.14)" }}>
        <Inbox size={18} color="var(--chakra-blue-light)" />
      </div>
      <div>
        <div className="insight-title">{title}</div>
        <div className="insight-body">{message}</div>
      </div>
    </div>
  );
}
