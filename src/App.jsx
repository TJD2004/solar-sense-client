import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/common/TopBar.jsx";
import NavTabs from "./components/common/NavTabs.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import NotificationDrawer from "./components/common/NotificationDrawer.jsx";
import { PanelSkeleton } from "./components/common/AsyncState.jsx";
import { SimulationProvider } from "./context/SimulationContext.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard.jsx"));
const Analytics = lazy(() => import("./pages/Analytics/Analytics.jsx"));
const Forecast = lazy(() => import("./pages/Forecast/Forecast.jsx"));
const Scheduler = lazy(() => import("./pages/Scheduler/Scheduler.jsx"));
const SubsidyCalculator = lazy(() => import("./pages/Subsidy/SubsidyCalculator.jsx"));
const Simulator = lazy(() => import("./pages/Simulator/Simulator.jsx"));
const CopilotPage = lazy(() => import("./pages/Copilot/CopilotPage.jsx"));

export default function App() {
  return (
    <LanguageProvider>
      <SimulationProvider>
        <NotificationProvider>
          <BrowserRouter>
            <div style={{ minHeight: "100vh", padding: "32px 20px 64px" }}>
              <div style={{ maxWidth: 1080, margin: "0 auto" }}>
                <a href="#main-content" className="sr-only">
                  Skip to main content
                </a>
                <TopBar />
                <NavTabs />
                <NotificationDrawer />
                <main id="main-content">
                  <ErrorBoundary>
                    <Suspense fallback={<PanelSkeleton rows={5} />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/forecast" element={<Forecast />} />
                        <Route path="/scheduler" element={<Scheduler />} />
                        <Route path="/subsidy" element={<SubsidyCalculator />} />
                        <Route path="/simulator" element={<Simulator />} />
                        <Route path="/copilot" element={<CopilotPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
              </div>
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </SimulationProvider>
    </LanguageProvider>
  );
}
