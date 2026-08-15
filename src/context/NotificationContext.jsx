import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useSimulation } from "./SimulationContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { live, anomalyActive, scenario, healthScore, offline } = useSimulation();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState(() => [
    {
      id: "init-welcome",
      type: "info", // "critical" | "warning" | "info"
      title: "SolarSense System Online",
      message: "Real-time IoT telemetry and digital twin connected.",
      ts: new Date(),
      read: false,
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const prevAnomalyRef = useRef(false);
  const prevBatteryLowRef = useRef(false);
  const prevBatteryFullRef = useRef(false);
  const prevScenarioRef = useRef(null);
  const prevGridHighRef = useRef(false);

  // Helper to add a notification
  const addNotification = useCallback((type, title, message) => {
    const item = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      ts: new Date(),
      read: false,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 50));
  }, []);

  const prevHighTempRef = useRef(false);
  const prevCloudyRef = useRef(false);

  // 1. Anomaly trigger
  useEffect(() => {
    if (anomalyActive && !prevAnomalyRef.current) {
      addNotification(
        "critical",
        t("notif_anomaly_title", "Production Anomaly Detected"),
        `${scenario?.label || "Solar generation drop"}: output is running below baseline.`
      );
    }
    prevAnomalyRef.current = anomalyActive;
  }, [anomalyActive, scenario, addNotification, t]);

  // 2. Scenario change trigger
  useEffect(() => {
    if (scenario?.id && scenario.id !== prevScenarioRef.current) {
      if (scenario.id !== "normal") {
        addNotification(
          "warning",
          t("notif_scenario_title", "Environmental Condition Changed"),
          `${scenario.emoji} ${scenario.label}: ${scenario.description}`
        );
      }
      prevScenarioRef.current = scenario.id;
    }
  }, [scenario, addNotification, t]);

  // 3. High Temperature Alert (>= 40°C / Panel >= 45°C)
  useEffect(() => {
    if (!live) return;
    const temp = live.panelTemp ?? live.ambientTemp ?? 25;
    const isHighTemp = temp >= 45 || (live.ambientTemp ?? 0) >= 40;

    if (isHighTemp && !prevHighTempRef.current) {
      addNotification(
        "critical",
        t("notif_temp_high_title", "🔥 High Panel Temperature Alert"),
        `Panel temperature reached ${temp.toFixed(1)}°C. Thermal efficiency loss is occurring.`
      );
      prevHighTempRef.current = true;
    } else if (!isHighTemp) {
      prevHighTempRef.current = false;
    }
  }, [live?.panelTemp, live?.ambientTemp, addNotification, t]);

  // 4. Heavy Cloud Cover / Low Solar Irradiance Alert (< 350 W/m²)
  useEffect(() => {
    if (!live) return;
    const irr = live.irradiance ?? 800;
    const isLowIrr = irr <= 350;

    if (isLowIrr && !prevCloudyRef.current) {
      addNotification(
        "warning",
        t("notif_cloud_title", "☁️ Heavy Cloud Cover Alert"),
        `Solar irradiance dropped to ${irr} W/m². Generation is reduced.`
      );
      prevCloudyRef.current = true;
    } else if (!isLowIrr) {
      prevCloudyRef.current = false;
    }
  }, [live?.irradiance, addNotification, t]);

  const prevSoilingRef = useRef(false);
  const prevShadingRef = useRef(false);
  const prevVoltageRef = useRef(false);

  // 4b. Soiling & Dust Buildup Alert
  useEffect(() => {
    if (!live) return;
    const isSoiled = scenario?.id === "soiling";
    if (isSoiled && !prevSoilingRef.current) {
      addNotification(
        "warning",
        t("notif_soiling_title", "🧹 Panel Dust & Soiling Warning"),
        `Dust/debris accumulation detected on solar array. Clean panels to restore efficiency.`
      );
      prevSoilingRef.current = true;
    } else if (!isSoiled) {
      prevSoilingRef.current = false;
    }
  }, [scenario?.id, live, addNotification, t]);

  // 4c. Shading Alert
  useEffect(() => {
    if (!live) return;
    const isShaded = scenario?.id === "shading";
    if (isShaded && !prevShadingRef.current) {
      addNotification(
        "warning",
        t("notif_shading_title", "🌳 Array Shading Alert"),
        `Obstruction detected shading portion of solar array.`
      );
      prevShadingRef.current = true;
    } else if (!isShaded) {
      prevShadingRef.current = false;
    }
  }, [scenario?.id, live, addNotification, t]);

  // 4d. AC Voltage Drop / Sag Alert (< 215V)
  useEffect(() => {
    if (!live || !live.acVoltage) return;
    const isLowVolt = live.acVoltage < 215;
    if (isLowVolt && !prevVoltageRef.current) {
      addNotification(
        "critical",
        t("notif_voltage_title", "⚡ Low Grid Voltage Sag Alert"),
        `Inverter AC voltage dropped to ${live.acVoltage} V. Grid instability detected.`
      );
      prevVoltageRef.current = true;
    } else if (!isLowVolt) {
      prevVoltageRef.current = false;
    }
  }, [live?.acVoltage, addNotification, t]);

  // 5. Battery triggers (< 20% or === 100%)
  useEffect(() => {
    if (!live) return;
    const batt = live.battery ?? 50;

    if (batt <= 20 && !prevBatteryLowRef.current) {
      addNotification(
        "warning",
        t("notif_battery_low_title", "Battery Level Low"),
        `Storage capacity is at ${batt}%. Consider delaying heavy appliance usage.`
      );
      prevBatteryLowRef.current = true;
    } else if (batt > 25) {
      prevBatteryLowRef.current = false;
    }

    if (batt >= 98 && !prevBatteryFullRef.current) {
      addNotification(
        "info",
        t("notif_battery_full_title", "Battery Fully Charged"),
        `Storage capacity reached 100%. Surplus power is exporting to the grid.`
      );
      prevBatteryFullRef.current = true;
    } else if (batt < 95) {
      prevBatteryFullRef.current = false;
    }
  }, [live?.battery, addNotification, t]);

  // 6. High Grid Import trigger (> 3 kW)
  useEffect(() => {
    if (!live) return;
    const gridNet = live.gridNet ?? 0;
    const isImportingHigh = gridNet <= -3.0;

    if (isImportingHigh && !prevGridHighRef.current) {
      addNotification(
        "warning",
        t("notif_grid_high_title", "High Grid Import"),
        `Currently drawing ${Math.abs(gridNet).toFixed(1)} kW from grid during peak hours.`
      );
      prevGridHighRef.current = true;
    } else if (!isImportingHigh) {
      prevGridHighRef.current = false;
    }
  }, [live?.gridNet, addNotification, t]);

  // 7. ML Prediction Anomaly — fired externally via addNotification from MLPredictionCard
  // (The card calls addNotification when deviation > 20% is detected. No polling here.)

  // Actions
  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        drawerOpen,
        setDrawerOpen,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
