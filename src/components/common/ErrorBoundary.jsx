import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertOctagon, RefreshCw } from "lucide-react";

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("SolarSense UI Error Caught:", error, info);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  handleReset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        className="bg-white border border-rose-200/80 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(244,63,94,0.08)] my-6 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              Something went wrong on this page
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              The rest of SolarSense is active — click try again or switch to another tab.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={this.handleReset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </button>
      </div>
    );
  }
}

export default function ErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundaryInner locationKey={location.pathname}>{children}</ErrorBoundaryInner>;
}
