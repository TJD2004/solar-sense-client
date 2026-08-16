import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { recommendWindow } from "../../services/simulator.js";
import { callOrFallback, chatWithCopilot } from "../../services/api.js";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function getStubReply(message, ctx, language) {
  const m = message.toLowerCase();
  const { curve, monthly, scenario } = ctx;

  if (language === "hi") {
    if (m.includes("month") || m.includes("उत्पादन") || m.includes("महीने")) {
      return `आपने इस महीने अब तक ${monthly.monthGeneratedKWh} kWh उत्पादन किया है।`;
    }
    if (m.includes("save") || m.includes("बचत") || m.includes("पैसे")) {
      return `आपने इस महीने कुल ${monthly.monthGeneratedKWh} kWh उत्पादन से ₹${monthly.savings.toLocaleString("en-IN")} की बचत की है।`;
    }
    if (m.includes("health") || m.includes("स्वास्थ्य") || m.includes("स्थिति")) {
      return scenario.id === "normal"
        ? "आपका सिस्टम स्वस्थ है — उत्पादन अपेक्षित वक्र के करीब चल रहा है।"
        : `${scenario.insight.title}: ${scenario.insight.body}`;
    }
    const rec = recommendWindow(curve, 1, 1.2);
    return `आज सबसे अच्छा सौर समय ${rec.window} है — उस समय 1.2 kW का उपकरण चलाने से ग्रिड की खपत कम होगी।`;
  }

  if (language === "mr") {
    if (m.includes("month") || m.includes("निर्मिती") || m.includes("महिना")) {
      return `तुम्ही या महिन्यात आतापर्यंत ${monthly.monthGeneratedKWh} kWh निर्मिती केली आहे.`;
    }
    if (m.includes("save") || m.includes("बचत") || m.includes("पैसे")) {
      return `तुम्ही या महिन्यात एकूण ${monthly.monthGeneratedKWh} kWh निर्मितीमधून ₹${monthly.savings.toLocaleString("en-IN")} ची बचत केली आहे.`;
    }
    if (m.includes("health") || m.includes("आरोग्य") || m.includes("परिस्थिती")) {
      return scenario.id === "normal"
        ? "तुमची सिस्टम उत्तम स्थितीत आहे — निर्मिती अपेक्षित आलेखाजवळ सुरू आहे."
        : `${scenario.insight.title}: ${scenario.insight.body}`;
    }
    const rec = recommendWindow(curve, 1, 1.2);
    return `आज सर्वोत्तम सौर वेळ ${rec.window} आहे — त्या वेळेत 1.2 kW चे उपकरण चालवल्यास ग्रिडचा वापर कमी होईल.`;
  }

  if (m.includes("month") && (m.includes("produce") || m.includes("generat"))) {
    return `You've generated ${monthly.monthGeneratedKWh} kWh this month so far.`;
  }
  if (m.includes("save") || m.includes("saving") || m.includes("money")) {
    return `You've saved ₹${monthly.savings.toLocaleString("en-IN")} so far this month, from ${monthly.monthGeneratedKWh} kWh generated.`;
  }
  if (m.includes("co2") || m.includes("carbon") || m.includes("environment")) {
    return `You've avoided about ${monthly.co2AvoidedKg} kg of CO₂ this month — roughly equivalent to ${monthly.treesPerYear} trees over a year.`;
  }
  const rec = recommendWindow(curve, 1, 1.2);
  return `The best solar window today is ${rec.window} — running a ~1.2 kW appliance then would cut roughly ${rec.reductionKWh} kWh of grid draw.`;
}

export default function CopilotPage() {
  const ctx = useSimulation();
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState([
    { role: "assistant", text: t("copilot_subtitle", "Ask me about your solar production, savings, or the best time to run something.") }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);

    const { reply, source } = await callOrFallback(
      () => chatWithCopilot(text),
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ reply: getStubReply(text, ctx, language), source: "heuristic" }), 500 + Math.random() * 400);
        })
    );
    setMessages((prev) => [...prev, { role: "assistant", text: reply, source }]);
    setThinking(false);
  }

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", height: 520 }}>
      <div className="panel-title">
        <Bot size={14} /> {t("ai_copilot_title", "SolarSense AI Copilot")}
      </div>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Solar AI Copilot"
        style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, marginTop: 10 }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            <div
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: msg.role === "user" ? "rgba(91,156,232,0.15)" : "rgba(255,153,51,0.15)",
              }}
            >
              {msg.role === "user" ? <User size={14} color="var(--chakra-blue-light)" /> : <Bot size={14} color="var(--saffron)" />}
            </div>
            <div
              style={{
                maxWidth: "75%",
                fontSize: 13,
                lineHeight: 1.5,
                padding: "10px 13px",
                borderRadius: 12,
                background: msg.role === "user" ? "rgba(91,156,232,0.1)" : "rgba(255,255,255,0.03)",
                border: "1px solid var(--hairline)",
                color: "var(--ink-100)",
              }}
            >
              {msg.text}
              {msg.source && (
                <div style={{ marginTop: 6, fontSize: 10, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {msg.source === "groq" ? "🧠 Groq" : "⚙️ Heuristic"}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              aria-hidden="true"
              style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,153,51,0.15)" }}
            >
              <Bot size={14} color="var(--saffron)" />
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{t("thinking", "thinking…")}</span>
          </div>
        )}
      </div>
      <form onSubmit={send} style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <label className="sr-only" htmlFor="copilot-input">Message the Solar AI Copilot</label>
        <input
          id="copilot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chat_placeholder", "Ask about solar output, battery optimization, or savings...")}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--hairline)",
            borderRadius: 9,
            padding: "10px 13px",
            color: "var(--ink-100)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Send message"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 18px",
            border: "none",
            borderRadius: 9,
            background: "linear-gradient(135deg, var(--saffron), var(--saffron-deep))",
            color: "#0A1626",
            cursor: thinking || !input.trim() ? "not-allowed" : "pointer",
            opacity: thinking || !input.trim() ? 0.6 : 1,
            fontWeight: 700,
          }}
        >
          {t("btn_send", "Send")} <Send size={14} style={{ marginLeft: 6 }} />
        </button>
      </form>
    </div>
  );
}
