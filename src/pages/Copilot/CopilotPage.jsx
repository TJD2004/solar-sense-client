import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, User, Brain, Table, ArrowRight, ShieldAlert, Sun, BatteryCharging, Zap } from "lucide-react";
import { recommendWindow } from "../../services/simulator.js";
import { callOrFallback, chatWithCopilot } from "../../services/api.js";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

// Guardrail keywords for blocking project/website source code queries
const CODE_PROJECT_KEYWORDS = [
  "code",
  "source",
  "project code",
  "website code",
  "repo",
  "repository",
  "github",
  "file structure",
  "script",
  "javascript",
  "html",
  "css",
  "api key",
  "backend",
  "frontend code",
  "show me the code",
  "give me code",
];

function isRequestingCodeOrProjectDetails(message) {
  const m = message.toLowerCase();
  return CODE_PROJECT_KEYWORDS.some((kw) => m.includes(kw));
}

function getStubReply(message, ctx, language) {
  const m = message.toLowerCase();
  const { curve, monthly, scenario } = ctx;

  // 1. Guardrail against project code/website internal details requests
  if (isRequestingCodeOrProjectDetails(message)) {
    return "I am specialized in helping you optimize your solar energy usage, understand generation insights, track monthly savings, and schedule home appliances. For privacy and security, I cannot provide internal website source code or project implementation details. Please ask any genuine solar operational query!";
  }

  // 2. Genuine Solar Query: Appliance Load Shift Table
  if (m.includes("table") || m.includes("breakdown") || m.includes("appliance") || m.includes("schedule")) {
    return `Here is your recommended solar appliance scheduling matrix:

| Appliance | Recommended Window | Grid Tariff Saved | Status |
| :--- | :--- | :--- | :--- |
| Washing Machine | 10:00 - 11:30 | ₹42.50 | Recommended |
| EV Fast Charger | 11:30 - 14:00 | ₹128.00 | Peak Solar |
| Water Heater Pump | 14:00 - 15:00 | ₹34.00 | Scheduled |`;
  }

  // 3. Genuine Solar Query: Battery Storage & Optimization
  if (m.includes("battery") || m.includes("storage") || m.includes("charge")) {
    return "To maximize your solar battery lifespan and performance:\n\n1. **Optimal Charging**: Charge your battery during peak solar production hours (**11:00 - 14:00**) when generation exceeds household load.\n2. **Depth of Discharge (DoD)**: Maintain your battery state of charge between **20% and 80%** to double its total cycle life.\n3. **Peak Tariff Discharge**: Discharge stored battery energy during evening peak hours (**18:00 - 21:00**) to avoid expensive grid tariffs.";
  }

  // 4. Genuine Solar Query: EV Charging
  if (m.includes("ev") || m.includes("car")) {
    const rec = recommendWindow(curve, 2, 3.3);
    return `The optimal solar window to charge your Electric Vehicle today is **${rec.window}**. Charging during this period utilizes direct excess solar yield, cutting approximately **${rec.reductionKWh} kWh** of expensive grid draw.`;
  }

  // 5. Genuine Solar Query: Monthly Generation & Savings
  if (m.includes("month") || m.includes("save") || m.includes("saving") || m.includes("money") || m.includes("bill")) {
    if (language === "hi") {
      return `आपने इस महीने अब तक **${monthly.monthGeneratedKWh} kWh** सौर ऊर्जा का उत्पादन किया है, जिससे कुल **₹${monthly.savings.toLocaleString("en-IN")}** की बचत हुई है!`;
    }
    if (language === "mr") {
      return `तुम्ही या महिन्यात आतापर्यंत **${monthly.monthGeneratedKWh} kWh** सौर ऊर्जेची निर्मिती केली आहे, ज्यामुळे **₹${monthly.savings.toLocaleString("en-IN")}** ची बचत झाली आहे!`;
    }
    return `So far this month, your solar system has generated **${monthly.monthGeneratedKWh} kWh**, saving you **₹${monthly.savings.toLocaleString("en-IN")}** on your electricity bill and avoiding **${monthly.co2AvoidedKg} kg** of CO₂ emissions.`;
  }

  // 6. Genuine Solar Query: Panel Maintenance & Cleaning
  if (m.includes("clean") || m.includes("dust") || m.includes("soiling") || m.includes("maintenance")) {
    return "Dust, bird droppings, and soiling can reduce solar absorption by **12% to 25%**. We recommend cleaning your solar panels with clean water and a soft squeegee once every 3 to 4 weeks early in the morning before panels get hot.";
  }

  // 7. General Default Solar Advice
  const rec = recommendWindow(curve, 1, 1.2);
  return `Your solar system is currently operating at optimal efficiency! Today's peak solar generation window is **${rec.window}**. Running high-power appliances during this window will maximize self-consumption and eliminate grid electricity costs.`;
}

export default function CopilotPage() {
  const ctx = useSimulation();
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: t("copilot_subtitle", "Hello! Ask me any genuine doubts about your solar generation, battery storage, bill savings, or optimal appliance scheduling."),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(e, textToSend) {
    if (e) e.preventDefault();
    const text = (textToSend || input).trim();
    if (!text || thinking) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    if (!textToSend) setInput("");
    setThinking(true);

    const { reply, source } = await callOrFallback(
      () => chatWithCopilot(text),
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ reply: getStubReply(text, ctx, language), source: "Solar AI Expert" }), 400 + Math.random() * 300);
        })
    );
    setMessages((prev) => [...prev, { role: "assistant", text: reply, source }]);
    setThinking(false);
  }

  const SUGGESTED_PROMPTS = [
    t("prompt_show_schedule", "Show appliance schedule table"),
    t("prompt_battery_life", "How to maximize battery storage life?"),
    t("prompt_savings", "How much money did I save this month?"),
    t("prompt_charge_ev", "When is the best time to charge my EV?"),
  ];

  return (
    <div className="bg-white border-2 border-purple-500/80 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.12)] flex flex-col h-[650px] relative overflow-hidden">
      {/* AI Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-lg font-display">{t("copilot_title", "SolarSense AI Assistant & Expert Guide")}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 font-mono-num">
                {t("copilot_badge", "Solar AI Expert")}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{t("copilot_subtitle_desc", "Your intelligent assistant for solar energy optimization, savings, battery management, and home appliance guidance.")}</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none border-b border-slate-100">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => send(null, p)}
            className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>{p}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Messages Stream Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-sky-100 text-sky-700 border border-sky-200"
                  : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-sky-500 text-white font-medium shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-800 font-medium shadow-xs"
              }`}
            >
              {msg.text.includes("|") ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono-num text-purple-700 font-bold">
                    <Table className="w-3.5 h-3.5" /> Structured Table View:
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono-num overflow-x-auto">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-line">{msg.text}</div>
              )}

              {msg.source && (
                <div className="mt-2 text-[10px] uppercase font-mono-num tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-600" />
                  <span>{msg.source === "groq" ? "Llama-3 Solar Engine" : "Solar AI Expert"}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono-num">Solar AI Copilot is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => send(e)} className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chat_placeholder", "Ask about solar output, battery optimization, savings, or appliance guidance...")}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>

      </form>
    </div>
  );
}

