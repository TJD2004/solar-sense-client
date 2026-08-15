import React from "react";
import { AlertOctagon } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("SolarSense UI error:", error, info);
  }

  handleReset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="panel" role="alert" style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
        <div className="insight-icon" style={{ background: "rgba(255,122,26,0.14)" }}>
          <AlertOctagon size={18} color="var(--saffron-deep)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="insight-title">Something went wrong on this page</div>
          <div className="insight-body">
            The rest of SolarSense is still running — try again, or switch to another tab.
          </div>
        </div>
        <button type="button" onClick={this.handleReset} className="ss-btn-ghost">
          Try again
        </button>
      </div>
    );
  }
}
