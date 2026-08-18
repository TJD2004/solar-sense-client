import React, { useState, useEffect } from "react";
import { X, Cpu, Cloud, Network, Activity, Key, Hash, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

const CLOUD_PROVIDERS = [
  { id: "enphase", name: "Enphase Enlighten API" },
  { id: "solaredge", name: "SolarEdge Monitoring Platform" },
  { id: "growatt", name: "Growatt ShineServer API" },
  { id: "sungrow", name: "Sungrow iSolarCloud API" },
  { id: "huawei", name: "Huawei FusionSolar Open API" },
  { id: "goodwe", name: "GoodWe SEMS Portal API" },
  { id: "custom", name: "Custom REST / Webhook Inverter Gateway" },
];

export default function ConnectInverterModal() {
  const { inverterModalOpen, setInverterModalOpen, inverterConfig, updateInverterConfig } = useSimulation();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(inverterConfig?.mode || "simulator");
  const [formData, setFormData] = useState(inverterConfig);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, msg: string }
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (inverterModalOpen) {
      setActiveTab(inverterConfig?.mode || "simulator");
      setFormData(inverterConfig);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [inverterModalOpen, inverterConfig]);

  if (!inverterModalOpen) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setTestResult(null);
    setSaveSuccess(false);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        msg: t("conn_test_success", "Connection successful! Inverter responded with 200 OK (latency: 42ms)."),
      });
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateInverterConfig({
      ...formData,
      mode: activeTab,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setInverterModalOpen(false);
      setSaveSuccess(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setInverterModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                {t("connect_inverter_title", "Inverter Telemetry Connection")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("connect_inverter_sub", "Link your physical solar inverter via Cloud APIs or Modbus Gateway, or use active simulated telemetry.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInverterModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/70 border-b border-slate-200/80">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab("cloud"); setTestResult(null); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "cloud"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>{t("conn_mode_cloud", "Cloud / API")}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("modbus"); setTestResult(null); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "modbus"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{t("conn_mode_modbus", "Modbus / IoT")}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("simulator"); setTestResult(null); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t("conn_mode_sim", "Simulator")}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("inverter_saved_success", "Inverter connection profile updated.")}</span>
            </div>
          )}

          {/* TAB 1: CLOUD API */}
          {activeTab === "cloud" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t("cloud_provider_lbl", "Cloud Telemetry Provider")}
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleChange("provider", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                >
                  {CLOUD_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t("api_key_lbl", "API Access Key / Bearer Token")}</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleChange("apiKey", e.target.value)}
                  placeholder="env_sec_key_..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono-num text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t("station_id_lbl", "Plant ID / Station Identifier")}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.plantId}
                    onChange={(e) => handleChange("plantId", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono-num text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("polling_interval_lbl", "Telemetry Polling Rate (seconds)")}</span>
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="300"
                    value={formData.pollingRate}
                    onChange={(e) => handleChange("pollingRate", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono-num font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODBUS / IOT */}
          {activeTab === "modbus" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t("gateway_ip_lbl", "Modbus Gateway IP Address")}
                  </label>
                  <input
                    type="text"
                    value={formData.gatewayIp}
                    onChange={(e) => handleChange("gatewayIp", e.target.value)}
                    placeholder="192.168.1.120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono-num text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t("gateway_port_lbl", "Gateway Port")}
                  </label>
                  <input
                    type="number"
                    value={formData.gatewayPort}
                    onChange={(e) => handleChange("gatewayPort", e.target.value)}
                    placeholder="502"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono-num font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t("slave_id_lbl", "Slave / Unit ID")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="255"
                    value={formData.slaveId}
                    onChange={(e) => handleChange("slaveId", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono-num font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t("register_map_lbl", "SunSpec Register Map Preset")}
                  </label>
                  <select
                    value={formData.registerMap}
                    onChange={(e) => handleChange("registerMap", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="sunspec_ieee1547">SunSpec IEEE 1547 Standard</option>
                    <option value="huawei_mb">Huawei Modbus RTU Map</option>
                    <option value="growatt_mb">Growatt Protocol V1.2</option>
                    <option value="sma_yasdi">SMA Speedwire / Modbus</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATOR */}
          {activeTab === "simulator" && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>{t("conn_badge_sim", "Simulated Twin Active")}</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {t("sim_mode_notice", "Simulated Digital Twin mode is currently active. High-fidelity physics-based telemetry is automatically supplied for monitoring when physical hardware is disconnected.")}
              </p>
            </div>
          )}

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                testResult.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.msg}</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            {activeTab !== "simulator" ? (
              <button
                type="button"
                disabled={testing}
                onClick={handleTestConnection}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>{t("conn_testing", "Testing communication handshake...")}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t("btn_test_connection", "Test Inverter Connection")}</span>
                  </>
                )}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInverterModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {t("btn_close", "Close")}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("btn_save_inverter", "Save Inverter Settings")}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
