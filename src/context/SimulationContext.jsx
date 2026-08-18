import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  buildTodayCurve,
  nextLiveReading,
  INITIAL_LIVE_READING,
  deriveDailyKWh,
  BASELINE_SYSTEM,
} from "../services/simulator.js";
import { deriveMonthlyImpact, deriveHealthScore } from "../services/derive.js";
import { getScenario, SCENARIO_LIST } from "../services/scenarios.js";
import { USE_BACKEND, setSimulatorScenario, setSimulatorOffline } from "../services/api.js";
import { getSocket } from "../services/socket.js";

const SimulationContext = createContext(null);

const TICK_MS = 2600;
const BOOT_MS = 900; // simulated "connecting to solar meter" delay
const BACKEND_GRACE_MS = 3500; // how long to wait for the first backend status before falling back
const MAX_LOG = 8;

export function SimulationProvider({ children }) {
  // ---- local (standalone) digital twin — the original in-browser simulator.
  // Doubles as the fallback whenever the backend is off, unreachable, or the
  // socket drops mid-session, so a flaky connection never breaks the demo.
  const [localScenarioId, setLocalScenarioId] = useState("normal");
  const [localOffline, setLocalOffline] = useState(false);
  const [localTick, setLocalTick] = useState(0);
  const [localLive, setLocalLive] = useState(INITIAL_LIVE_READING);

  // ---- backend-driven state, populated from Socket.IO events when connected.
  const [backendStatus, setBackendStatus] = useState(null); // full 'solar:status' payload
  const [backendLive, setBackendLive] = useState(null); // latest 'solar:live' tick

  // ---- connection lifecycle
  const [initializing, setInitializing] = useState(true);
  const [connection, setConnection] = useState(USE_BACKEND ? "connecting" : "standalone");
  // "standalone" | "connecting" | "live" | "reconnecting" | "fallback"
  const usingFallback = connection === "standalone" || (connection === "fallback" && !backendStatus);

  // ---- event log, newest first — turns scenario/connection changes into a
  // visible timeline for the demo instead of a silent state flip.
  const [eventLog, setEventLog] = useState([]);
  const logEvent = useCallback((emoji, message) => {
    setEventLog((prev) => [{ id: `${Date.now()}-${Math.random()}`, ts: new Date(), emoji, message }, ...prev].slice(0, MAX_LOG));
  }, []);

  const prevAnomalyRef = useRef(false);
  const prevScenarioRef = useRef(undefined);
  const prevOfflineRef = useRef(false);

  // ---- boot delay for standalone mode only; backend mode resolves
  // `initializing` as soon as the first status/timeout lands, below.
  useEffect(() => {
    if (USE_BACKEND) return undefined;
    const id = setTimeout(() => setInitializing(false), BOOT_MS);
    return () => clearTimeout(id);
  }, []);

  // ---- local ticking — only actually drives the UI while usingFallback is
  // true, but it's harmless (and cheap) to keep it running in the
  // background even when live, so a dropped connection has somewhere to
  // fall back to instantly instead of a blank state.
  useEffect(() => {
    if (localOffline) return undefined;
    const id = setInterval(() => {
      setLocalTick((t) => t + 1);
      setLocalLive((prev) => nextLiveReading(prev, localScenarioId));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [localScenarioId, localOffline]);

  // ---- backend socket wiring
  useEffect(() => {
    if (!USE_BACKEND) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    let fellBack = false;
    const graceTimer = setTimeout(() => {
      if (!backendStatusRef.current) {
        fellBack = true;
        setConnection((c) => (c === "live" ? c : "fallback"));
        setInitializing(false);
        logEvent("⚠️", "Live feed unavailable — showing local simulation");
      }
    }, BACKEND_GRACE_MS);

    function onStatus(status) {
      clearTimeout(graceTimer);
      setBackendStatus(status);
      setBackendLive(status.live);
      setInitializing(false);
      setConnection("live");
    }

    function onLive(live) {
      setBackendLive(live);
      setBackendStatus((prev) => (prev ? { ...prev, live } : prev));
    }

    function onConnectError() {
      setConnection((prev) => (prev === "live" ? "reconnecting" : prev));
    }

    function onDisconnect() {
      setConnection((prev) => {
        if (prev === "live") logEvent("📡", "Live connection lost — reconnecting…");
        return "reconnecting";
      });
    }

    socket.on("solar:status", onStatus);
    socket.on("solar:live", onLive);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);

    return () => {
      clearTimeout(graceTimer);
      socket.off("solar:status", onStatus);
      socket.off("solar:live", onLive);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backendStatusRef = useRef(backendStatus);
  useEffect(() => {
    backendStatusRef.current = backendStatus;
  }, [backendStatus]);

  // ---- derive the "active" state: backend when live, local otherwise
  const scenarioId = !usingFallback && backendStatus ? backendStatus.scenarioId : localScenarioId;
  const offline = !usingFallback && backendStatus ? backendStatus.offline : localOffline;
  const tick = !usingFallback && backendLive ? backendLive.tick : localTick;

  const live = useMemo(() => {
    if (!usingFallback && backendLive) return backendLive;
    return localLive;
  }, [usingFallback, backendLive, localLive]);

  const curve = useMemo(() => {
    if (!usingFallback && backendStatus) return backendStatus.curve;
    return buildTodayCurve(scenarioId);
  }, [usingFallback, backendStatus, scenarioId]);

  const dailyKWh = useMemo(() => {
    if (!usingFallback && backendStatus) return backendStatus.dailyKWh;
    return deriveDailyKWh(curve);
  }, [usingFallback, backendStatus, curve]);

  const healthScore = useMemo(() => {
    if (!usingFallback && backendStatus) return backendStatus.healthScore;
    return deriveHealthScore(curve);
  }, [usingFallback, backendStatus, curve]);

  const monthly = useMemo(() => {
    if (!usingFallback && backendStatus) return backendStatus.monthly;
    return deriveMonthlyImpact({ dailyKWh });
  }, [usingFallback, backendStatus, dailyKWh]);

  const scenario = !usingFallback && backendStatus ? backendStatus.scenario : getScenario(scenarioId);
  const scenarios = !usingFallback && backendStatus ? backendStatus.scenarios : SCENARIO_LIST;

  const transientBlip = !usingFallback && backendStatus
    ? backendStatus.transientBlip
    : scenarioId === "normal" && tick > 0 && tick % 9 === 0;

  const isExtremeTemp = (live?.panelTemp >= 45) || (live?.ambientTemp >= 40);
  const isCloudyOrRain = (live?.irradiance !== undefined && live?.irradiance <= 350);
  const anomalyActive = !usingFallback && backendStatus
    ? backendStatus.anomalyActive
    : scenarioId !== "normal" || transientBlip || isExtremeTemp || isCloudyOrRain;

  // ---- System Profile, Inverter Config, and Service Request State
  const [systemProfile, setSystemProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem("solarsense_system_profile");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      installerCompany: "Tata Power Solar",
      inverterModel: "Sungrow SG5.0RS",
      capacityKW: 5.0,
      panelCount: 12,
      batteryCapacityKWh: 10.0,
      installationDate: "2024-03-15",
    };
  });

  const updateSystemProfile = useCallback((newProfile) => {
    setSystemProfileState((prev) => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem("solarsense_system_profile", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const [inverterConfig, setInverterConfigState] = useState(() => {
    try {
      const saved = localStorage.getItem("solarsense_inverter_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      mode: "simulator", // "cloud" | "modbus" | "simulator"
      provider: "enphase",
      apiKey: "env_key_live_solar_84920",
      plantId: "STATION-IND-4019",
      serialNumber: "SN-984217",
      pollingRate: 5,
      gatewayIp: "192.168.1.120",
      gatewayPort: 502,
      slaveId: 1,
      registerMap: "sunspec_ieee1547",
    };
  });

  const updateInverterConfig = useCallback((newConfig) => {
    setInverterConfigState((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem("solarsense_inverter_config", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const [serviceTickets, setServiceTickets] = useState(() => {
    try {
      const saved = localStorage.getItem("solarsense_service_tickets");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const addServiceTicket = useCallback((ticket) => {
    setServiceTickets((prev) => {
      const updated = [ticket, ...prev];
      try {
        localStorage.setItem("solarsense_service_tickets", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Global Modal Visibility States
  const [systemModalOpen, setSystemModalOpen] = useState(false);
  const [inverterModalOpen, setInverterModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalInitialData, setServiceModalInitialData] = useState(null);

  const openServiceModal = useCallback((initialData = null) => {
    setServiceModalInitialData(initialData);
    setServiceModalOpen(true);
  }, []);

  const baselineSystem = useMemo(() => {
    const userCapacity = Number(systemProfile?.capacityKW) || BASELINE_SYSTEM.capacityKW;
    if (!usingFallback && backendStatus) {
      return { ...backendStatus.baselineSystem, capacityKW: userCapacity };
    }
    return { capacityKW: userCapacity, dailyKWh };
  }, [usingFallback, backendStatus, dailyKWh, systemProfile?.capacityKW]);

  const overrides = useMemo(() => {
    if (!usingFallback && backendStatus) return backendStatus.overrides || {};
    return {};
  }, [usingFallback, backendStatus]);

  // ---- log scenario / offline / anomaly transitions, whichever source
  // they come from, so the timeline reads the same regardless of mode.
  useEffect(() => {
    if (prevScenarioRef.current !== scenarioId) {
      const def = getScenario(scenarioId);
      if (prevScenarioRef.current !== undefined) logEvent(def.emoji, `${def.label} triggered`);
      prevScenarioRef.current = scenarioId;
    }
  }, [scenarioId, logEvent]);

  useEffect(() => {
    if (prevOfflineRef.current !== offline) {
      logEvent(offline ? "📴" : "📶", offline ? "Meter connection dropped" : "Meter back online");
      prevOfflineRef.current = offline;
    }
  }, [offline, logEvent]);

  useEffect(() => {
    if (!prevAnomalyRef.current && anomalyActive) {
      logEvent("🚨", "Production anomaly detected");
    }
    prevAnomalyRef.current = anomalyActive;
  }, [anomalyActive, logEvent]);

  // ---- actions: talk to the backend when live, mutate local state
  // otherwise — either way every page keeps calling the same functions.
  const setScenario = useCallback(
    (id) => {
      const validId = SCENARIO_LIST.some((s) => s.id === id) ? id : "normal";
      setLocalScenarioId(validId);
      if (!usingFallback) {
        setSimulatorScenario(validId).catch(() => {
          // socket will recover via 'disconnect'/'connect_error'; local
          // state above already reflects the intended change either way
        });
      }
    },
    [usingFallback]
  );

  const toggleOffline = useCallback(() => {
    setLocalOffline((prevLocal) => {
      const next = !prevLocal;
      if (!usingFallback) {
        setSimulatorOffline(next).catch(() => {});
      }
      return next;
    });
  }, [usingFallback]);

  const value = useMemo(
    () => ({
      scenarioId,
      scenario,
      scenarios,
      setScenario,
      offline,
      toggleOffline,
      initializing,
      live,
      curve,
      dailyKWh,
      healthScore,
      monthly,
      anomalyActive,
      transientBlip,
      baselineSystem,
      overrides,
      // system onboarding & hardware
      systemProfile,
      updateSystemProfile,
      inverterConfig,
      updateInverterConfig,
      serviceTickets,
      addServiceTicket,
      // modal triggers
      systemModalOpen,
      setSystemModalOpen,
      inverterModalOpen,
      setInverterModalOpen,
      serviceModalOpen,
      setServiceModalOpen,
      serviceModalInitialData,
      openServiceModal,
      // game-like / real-time extras
      connection, // "standalone" | "connecting" | "live" | "reconnecting" | "fallback"
      isLive: connection === "live",
      eventLog,
    }),
    [
      scenarioId,
      scenario,
      scenarios,
      setScenario,
      offline,
      toggleOffline,
      initializing,
      live,
      curve,
      dailyKWh,
      healthScore,
      monthly,
      anomalyActive,
      transientBlip,
      baselineSystem,
      overrides,
      systemProfile,
      updateSystemProfile,
      inverterConfig,
      updateInverterConfig,
      serviceTickets,
      addServiceTicket,
      systemModalOpen,
      inverterModalOpen,
      serviceModalOpen,
      serviceModalInitialData,
      openServiceModal,
      connection,
      eventLog,
    ]
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within a SimulationProvider");
  return ctx;
}
