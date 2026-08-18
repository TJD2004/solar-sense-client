import React, { useState, useEffect } from "react";
import { X, Sun, Building2, Cpu, Zap, Layers, BatteryCharging, Calendar, CheckCircle2 } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function SystemProfileModal() {
  const { systemModalOpen, setSystemModalOpen, systemProfile, updateSystemProfile } = useSimulation();
  const { t } = useLanguage();

  const [formData, setFormData] = useState(systemProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (systemModalOpen) {
      setFormData(systemProfile);
      setSavedSuccess(false);
    }
  }, [systemModalOpen, systemProfile]);

  if (!systemModalOpen) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSystemProfile({
      ...formData,
      capacityKW: Math.max(0.5, parseFloat(formData.capacityKW) || 5.0),
      panelCount: Math.max(1, parseInt(formData.panelCount, 10) || 12),
      batteryCapacityKWh: Math.max(0, parseFloat(formData.batteryCapacityKWh) || 0),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSystemModalOpen(false);
      setSavedSuccess(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setSystemModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sun className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                {t("system_profile_title", "Solar Plant Setup & Onboarding")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("system_profile_sub", "Configure your installed solar hardware, inverter specifications, and commissioning details.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSystemModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("system_saved_success", "System specifications saved successfully!")}</span>
            </div>
          )}

          {/* Installer Company */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("installer_company_lbl", "Installation Company / EPC Partner")}</span>
            </label>
            <input
              type="text"
              required
              value={formData.installerCompany}
              onChange={(e) => handleChange("installerCompany", e.target.value)}
              placeholder={t("installer_company_placeholder", "e.g. Tata Power Solar, Adani Solar, Loom Solar")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
          </div>

          {/* Inverter Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>{t("inverter_brand_model_lbl", "Inverter Manufacturer & Model")}</span>
            </label>
            <input
              type="text"
              required
              value={formData.inverterModel}
              onChange={(e) => handleChange("inverterModel", e.target.value)}
              placeholder={t("inverter_brand_model_placeholder", "e.g. Sungrow SG5.0RS, Growatt 5kW, Enphase IQ8")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
          </div>

          {/* Grid 2-col: Capacity & Panel Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t("solar_capacity_lbl", "Total Installed Solar Capacity (kW)")}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="1000"
                required
                value={formData.capacityKW}
                onChange={(e) => handleChange("capacityKW", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold font-mono-num text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t("panel_count_lbl", "Number of Solar Panels")}</span>
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                required
                value={formData.panelCount}
                onChange={(e) => handleChange("panelCount", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold font-mono-num text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Grid 2-col: Battery & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t("battery_capacity_lbl", "Battery Storage Capacity (kWh)")}</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="1000"
                required
                value={formData.batteryCapacityKWh}
                onChange={(e) => handleChange("batteryCapacityKWh", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold font-mono-num text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{t("install_date_lbl", "Commissioning / Installation Date")}</span>
              </label>
              <input
                type="date"
                required
                value={formData.installationDate}
                onChange={(e) => handleChange("installationDate", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSystemModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t("btn_close", "Close")}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all flex items-center gap-2"
            >
              <Sun className="w-4 h-4" />
              <span>{t("btn_save_system", "Save System Specifications")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
