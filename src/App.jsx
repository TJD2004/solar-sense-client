import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/common/TopBar.jsx";
import NavTabs from "./components/common/NavTabs.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import NotificationDrawer from "./components/common/NotificationDrawer.jsx";
import { SimulationProvider } from "./context/SimulationContext.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

import SystemProfileModal from "./components/Modals/SystemProfileModal.jsx";
import ConnectInverterModal from "./components/Modals/ConnectInverterModal.jsx";
import ServiceRequestModal from "./components/Modals/ServiceRequestModal.jsx";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Analytics from "./pages/Analytics/Analytics.jsx";
import Forecast from "./pages/Forecast/Forecast.jsx";
import Scheduler from "./pages/Scheduler/Scheduler.jsx";
import SubsidyCalculator from "./pages/Subsidy/SubsidyCalculator.jsx";
import Simulator from "./pages/Simulator/Simulator.jsx";
import CopilotPage from "./pages/Copilot/CopilotPage.jsx";

export default function App() {
  return (
    <LanguageProvider>
      <SimulationProvider>
        <NotificationProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-amber-500 focus:text-white z-50">
                Skip to main content
              </a>
              
              {/* Unified Minimalist Header Bar */}
              <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs mb-6">
                <TopBar />
                <NavTabs />
              </header>

              <NotificationDrawer />
              <SystemProfileModal />
              <ConnectInverterModal />
              <ServiceRequestModal />

              <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 pb-16">
                <ErrorBoundary>
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
                </ErrorBoundary>
              </main>
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </SimulationProvider>
    </LanguageProvider>
  );
}
