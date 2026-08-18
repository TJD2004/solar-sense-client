import React, { useState, useEffect } from "react";
import { X, Wrench, ShieldAlert, Clock, User, Phone, MapPin, FileText, CheckCircle2, Loader2, Sparkles, Building2 } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function ServiceRequestModal() {
  const {
    serviceModalOpen,
    setServiceModalOpen,
    serviceModalInitialData,
    systemProfile,
    scenario,
    addServiceTicket,
  } = useSimulation();
  const { t } = useLanguage();

  const [issueType, setIssueType] = useState("inverter_fault");
  const [priority, setPriority] = useState("critical");
  const [customerName, setCustomerName] = useState("Rajesh Sharma");
  const [customerPhone, setCustomerPhone] = useState("+91 98201 45892");
  const [customerAddress, setCustomerAddress] = useState("Flat 402, Sunshine Heights, Baner Road, Pune - 411045");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    if (serviceModalOpen) {
      setSubmittedTicket(null);
      setSubmitting(false);

      if (serviceModalInitialData?.issue) {
        setIssueType(serviceModalInitialData.issue);
      } else if (scenario?.id === "inverter_drop") {
        setIssueType("inverter_fault");
      } else if (scenario?.id === "severe_shading") {
        setIssueType("shading");
      } else if (scenario?.id === "dirty_panels") {
        setIssueType("soiling");
      } else {
        setIssueType("inverter_fault");
      }

      if (serviceModalInitialData?.notes) {
        setNotes(serviceModalInitialData.notes);
      } else {
        setNotes("");
      }
    }
  }, [serviceModalOpen, serviceModalInitialData, scenario]);

  if (!serviceModalOpen) return null;

  const nowFormatted = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const ticketId = `SOL-SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: ticketId,
      issueType,
      priority,
      customerName,
      customerPhone,
      customerAddress,
      notes,
      timestamp: new Date().toISOString(),
      installer: systemProfile?.installerCompany || "Tata Power Solar",
      systemDetails: `${systemProfile?.capacityKW || 5} kW (${systemProfile?.inverterModel || "Sungrow SG5.0RS"})`,
    };

    setTimeout(() => {
      setSubmitting(false);
      addServiceTicket(newTicket);
      setSubmittedTicket(newTicket);
    }, 1000);
  };

  const getIssueLabel = (key) => {
    switch (key) {
      case "inverter_fault":
        return t("issue_inverter_fault", "Inverter Hardware & Phase Fault");
      case "shading":
        return t("issue_shading", "Severe Tree Shading & Bypass Diode Strain");
      case "soiling":
        return t("issue_soiling", "Heavy Dust / Soiling Layer Requiring Panel Cleaning");
      case "cell_damage":
        return t("issue_cell_damage", "Cell Degradation / Hotspot Detection");
      case "grid_sync":
        return t("issue_grid_sync", "Grid Synchronization & Export Phase Drop");
      default:
        return t("issue_routine_maint", "Routine Annual Maintenance & Inspection");
    }
  };

  const getPriorityEta = (p) => {
    if (p === "critical") return "Within 4 Hours (Emergency Dispatch)";
    if (p === "high") return "Within 24 Hours";
    return "Within 48–72 Hours (Scheduled)";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setServiceModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                {t("service_modal_title", "Request Technician & Maintenance")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("service_modal_sub", "Dispatch a certified technician to inspect and resolve solar hardware or performance anomalies.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setServiceModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {submittedTicket ? (
          <div className="p-6 space-y-5 text-center flex-1 overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {t("ticket_success_title", "Service Ticket Dispatched!")}
              </h3>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                {t("ticket_success_desc", "Your service request has been registered with your installation partner. A certified solar technician will arrive within your designated service window.")}
              </p>
            </div>

            {/* Ticket Details Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-500">{t("ticket_id_lbl", "Ticket ID:")}</span>
                <span className="font-extrabold text-blue-600 font-mono-num bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {submittedTicket.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">{t("assigned_technician_lbl", "Assigned EPC Partner:")}</span>
                <span className="font-bold text-slate-800">{submittedTicket.installer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">{t("service_window_lbl", "Estimated Technician Arrival:")}</span>
                <span className="font-bold text-emerald-700">{getPriorityEta(submittedTicket.priority)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                {t("btn_close", "Close")}
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Auto System Snapshot Box */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-900">
                  {systemProfile?.installerCompany} • {systemProfile?.capacityKW} kW ({systemProfile?.inverterModel})
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                <Clock className="w-3.5 h-3.5" />
                <span>{nowFormatted}</span>
              </div>
            </div>

            {/* Issue / Anomaly Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>{t("detected_issue_lbl", "Detected Anomaly / Issue")}</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
              >
                <option value="inverter_fault">{getIssueLabel("inverter_fault")}</option>
                <option value="shading">{getIssueLabel("shading")}</option>
                <option value="soiling">{getIssueLabel("soiling")}</option>
                <option value="cell_damage">{getIssueLabel("cell_damage")}</option>
                <option value="grid_sync">{getIssueLabel("grid_sync")}</option>
                <option value="routine_maint">{getIssueLabel("routine_maint")}</option>
              </select>
            </div>

            {/* Severity / Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t("service_priority_lbl", "Service Priority Level")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "critical", label: t("priority_critical", "Critical (4-Hour)"), color: "rose" },
                  { id: "high", label: t("priority_high", "High (24-Hour)"), color: "amber" },
                  { id: "medium", label: t("priority_medium", "Standard"), color: "slate" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-center border ${
                      priority === p.id
                        ? p.id === "critical"
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : p.id === "high"
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Col: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("customer_name_lbl", "Homeowner Name")}</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t("customer_phone_lbl", "Contact Phone Number")}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium font-mono-num text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t("customer_address_lbl", "Installation Site Address & Pincode")}</span>
              </label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{t("service_notes_lbl", "Additional Observations / Notes")}</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("service_notes_placeholder", "Describe any visible physical damage, sounds, or errors observed on the inverter or rooftop...")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 outline-none resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {t("btn_close", "Close")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("submitting_request", "Dispatching ticket to EPC technician network...")}</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    <span>{t("btn_submit_service_request", "Submit Service Ticket")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
