import React from "react";
import { MessageCircle } from "lucide-react";

// Placeholder launcher for the Solar AI Copilot chat feature (hero feature #4,
// not in the current MVP scope). Wire onClick to open a chat panel that calls
// chatWithCopilot() from services/api.js once the backend route exists.
export default function CopilotLauncher({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mini-panel panel"
      style={{ width: "100%", cursor: "pointer", border: "1px solid var(--hairline)", background: "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MessageCircle size={18} color="var(--chakra-blue-light)" />
        <span style={{ fontSize: 13, color: "var(--ink-300)" }}>Ask the Solar Copilot…</span>
      </div>
    </button>
  );
}
