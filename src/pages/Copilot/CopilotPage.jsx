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
  const { curve, monthly, scenario, live, healthScore, dailyKWh } = ctx;
  const isHi = language === "hi";
  const isMr = language === "mr";

  // 1. Guardrail against project code/website internal details requests
  if (isRequestingCodeOrProjectDetails(message)) {
    return "I am specialized in helping you optimize your solar energy usage, understand generation insights, track monthly savings, and schedule home appliances. For privacy and security, I cannot provide internal website source code or project implementation details. Please ask any genuine solar operational query!";
  }

  // 2. Appliance Load Shift Table / Whole Day Schedule
  if (m.includes("table") || m.includes("breakdown") || m.includes("appliance") || m.includes("schedule") || 
      m.includes("whole day") || m.includes("matrix") || m.includes("सारणी") || m.includes("सूची") || m.includes("वेळापत्रक") || m.includes("शेड्यूल")) {
    if (isHi) {
      return `यहाँ आपकी अनुशंसित सौर उपकरण शेड्यूलिंग तालिका है:

| उपकरण | अनुशंसित समय | बचाई गई ग्रिड राशि | स्थिति |
| :--- | :--- | :--- | :--- |
| वाशिंग मशीन | 10:00 - 11:30 | ₹42.50 | अनुशंसित |
| ईवी फास्ट चार्जर | 11:30 - 14:00 | ₹128.00 | पीक सोलर |
| वॉटर हीटर पंप | 14:00 - 15:00 | ₹34.00 | निर्धारित |`;
    }
    if (isMr) {
      return `येथे तुमचे शिफारस केलेले सौर उपकरण वेळापत्रक आहे:

| उपकरण | शिफारस केलेली वेळ | वाचवलेले पैसे | स्थिती |
| :--- | :--- | :--- | :--- |
| वॉशिंग मशीन | 10:00 - 11:30 | ₹42.50 | शिफारस केलेले |
| ईव्ही फास्ट चार्जर | 11:30 - 14:00 | ₹128.00 | उच्च सूर्याचे तास |
| वॉटर हीटर पंप | 14:00 - 15:00 | ₹34.00 | वेळापत्रकात समाविष्ट |`;
    }
    return `Here is your recommended solar appliance scheduling matrix:

| Appliance | Recommended Window | Grid Tariff Saved | Status |
| :--- | :--- | :--- | :--- |
| Washing Machine | 10:00 - 11:30 | ₹42.50 | Recommended |
| EV Fast Charger | 11:30 - 14:00 | ₹128.00 | Peak Solar |
| Water Heater Pump | 14:00 - 15:00 | ₹34.00 | Scheduled |`;
  }

  // 3. Battery Storage / Remaining Charge (e.g. "how much charging is left", "battery status")
  if (m.includes("battery") || m.includes("storage") || m.includes("charg") || m.includes("bess") || m.includes("soc") ||
      m.includes("बैटरी") || m.includes("बॅटरी") || m.includes("भंडारण") || m.includes("साठवण") || m.includes("चार्ज")) {
    const battPct = live?.battery ?? 76;
    const battPwr = live?.battPower ?? 1.18;
    
    if (m.includes("left") || m.includes("remain") || m.includes("much") || m.includes("percent") || m.includes("level") || m.includes("status") || m.includes("now") || m.includes("current") || m.includes("बाकी") || m.includes("किती") || m.includes("कितना") || m.includes("स्थिती")) {
      const flowText = battPwr > 0 ? `+${battPwr} kW charging with solar surplus` : battPwr < 0 ? `${Math.abs(battPwr)} kW discharging for home load` : "idle";
      if (isHi) return `आपकी सौर बैटरी (BESS) वर्तमान में **${battPct}%** चार्ज है (${battPwr > 0 ? `अतिरिक्त सौर ऊर्जा से +${battPwr} kW चार्ज हो रही है` : battPwr < 0 ? `घर के लोड के लिए ${Math.abs(battPwr)} kW डिस्चार्ज हो रही है` : "सक्रिय"}).`;
      if (isMr) return `तुमची सौर बॅटरी (BESS) सध्या **${battPct}%** चार्ज आहे (${battPwr > 0 ? `अतिरिक्त सौर ऊर्जेतून +${battPwr} kW चार्ज होत आहे` : battPwr < 0 ? `घराच्या वापरासाठी ${Math.abs(battPwr)} kW डिस्चार्ज होत आहे` : "सक्रिय"}).`;
      return `Your solar battery (BESS) is currently at **${battPct}%** capacity (${flowText}).`;
    }

    if (isHi) {
      return "सौर बैटरी का जीवनकाल और प्रदर्शन बढ़ाने के लिए:\n\n1. **सर्वोत्तम चार्जिंग**: बैटरी को चरम सौर उत्पादन घंटों (**11:00 - 14:00**) के दौरान चार्ज करें।\n2. **डिस्चार्ज की सीमा (DoD)**: अपनी बैटरी को **20% से 80%** के बीच रखें, इससे बैटरी का जीवन दोगुना हो जाएगा।\n3. **पीक टैरिफ डिस्चार्ज**: महंगे ग्रिड टैरिफ से बचने के लिए शाम के पीक घंटों (**18:00 - 21:00**) में संचित ऊर्जा का उपयोग करें।";
    }
    if (isMr) {
      return "सौर बॅटरीचे आयुष्य आणि कामगिरी वाढवण्यासाठी:\n\n1. **सर्वोत्तम चार्जिंग**: बॅटरी पीक सौर निर्मिती तासांमध्ये (**11:00 - 14:00**) चार्ज करा।\n2. **डिस्चार्जची खोली (DoD)**: बॅटरीची चार्ज पातळी **20% ते 80%** दरम्यान ठेवा, यामुळे बॅटरीचे एकूण आयुष्य दुप्पट होईल।\n3. **पीक डिस्चार्ज**: महाग ग्रिड दर टाळण्यासाठी संध्याकाळच्या पीक वेळेत (**18:00 - 21:00**) साठवलेली वीज वापरा।";
    }
    return "To maximize your solar battery lifespan and performance:\n\n1. **Optimal Charging**: Charge your battery during peak solar production hours (**11:00 - 14:00**) when generation exceeds household load.\n2. **Depth of Discharge (DoD)**: Maintain your battery state of charge between **20% and 80%** to double its total cycle life.\n3. **Peak Tariff Discharge**: Discharge stored battery energy during evening peak hours (**18:00 - 21:00**) to avoid expensive grid tariffs.";
  }

  // 4. EV Charging Time
  if (m.includes("ev") || m.includes("car") || m.includes("vehicle") || m.includes("गाड़ी") || m.includes("गाडी") || m.includes("वाहन")) {
    const rec = recommendWindow(curve, 2, 3.3);
    if (isHi) {
      return `आपकी इलेक्ट्रिक गाड़ी को चार्ज करने का सर्वोत्तम समय आज **${rec.window}** है। इस समय चार्ज करने से आप सीधे अतिरिक्त सौर उत्पादन का उपयोग करेंगे, जिससे लगभग **${rec.reductionKWh} kWh** ग्रिड बिजली की बचत होगी।`;
    }
    if (isMr) {
      return `आज तुमचे इलेक्ट्रिक वाहन चार्ज करण्याची सर्वोत्तम वेळ **${rec.window}** आहे। यादरम्यान चार्ज केल्याने थेट अतिरिक्त सौर ऊर्जेचा वापर होईल, ज्यामुळे महावितरणच्या विजेवरील अवलंबित्व सुमारे **${rec.reductionKWh} kWh** कमी होईल।`;
    }
    return `The optimal solar window to charge your Electric Vehicle today is **${rec.window}**. Charging during this period utilizes direct excess solar yield, cutting approximately **${rec.reductionKWh} kWh** of expensive grid draw.`;
  }

  // 5. AC Usage
  if (m.includes("ac") || m.includes("air cond") || m.includes("cooler") || m.includes("एसी") || m.includes("कूलर")) {
    const rec = recommendWindow(curve, 3, 2.0);
    if (isHi) {
      return `एसी चलाने का सर्वोत्तम समय आज **${rec.window}** है, जब धूप सबसे तेज होती है और पर्याप्त सौर ऊर्जा उपलब्ध होती है। इस समय एसी चलाने से आप लगभग **${rec.reductionKWh} kWh** ग्रिड बिजली बचाएंगे।`;
    }
    if (isMr) {
      return `एसी वापरण्याची सर्वोत्तम वेळ आज **${rec.window}** आहे, जेव्हा सूर्यप्रकाश जास्त असतो आणि मुबलक वीज उपलब्ध असते। यादरम्यान वापर केल्यास सुमारे **${rec.reductionKWh} kWh** विजेची बचत होईल।`;
    }
    return `The best window to run your Air Conditioner today is **${rec.window}** when solar production is at peak, saving approximately **${rec.reductionKWh} kWh** of grid draw.`;
  }

  // 6. Live Solar Generation Telemetry
  if (m.includes("solar") || m.includes("generation") || m.includes("produce") || m.includes("producing") || m.includes("output") || m.includes("उत्पादन") || m.includes("निर्मिती")) {
    const solVal = live?.solar ?? 4.72;
    const todayTotal = dailyKWh ?? 24.5;
    if (isHi) return `सोलर पैनल अभी **${solVal} kW** ऊर्जा बना रहे हैं (आज कुल अपेक्षित उत्पादन: **${todayTotal} kWh**)।`;
    if (isMr) return `सौर पॅनेल्स सध्या **${solVal} kW** वीज निर्माण करत आहेत (आजचे एकूण अपेक्षित उत्पादन: **${todayTotal} kWh**)।`;
    return `Your solar array is currently generating **${solVal} kW** (today's projected total is **${todayTotal} kWh**).`;
  }

  // 7. Live Household Consumption / Load
  if (m.includes("load") || m.includes("consumption") || m.includes("home") || m.includes("use") || m.includes("usage") || m.includes("draw") || m.includes("खपत") || m.includes("वापर") || m.includes("खर्च")) {
    const loadVal = live?.home ?? 2.10;
    if (isHi) return `आपके घर का वर्तमान बिजली लोड **${loadVal} kW** है।`;
    if (isMr) return `तुमच्या घराचा सध्याचा वीज लोड **${loadVal} kW** आहे।`;
    return `Your home is currently consuming **${loadVal} kW** of electrical load.`;
  }

  // 8. Live Grid Export / Import / Net Metering
  if (m.includes("grid") || m.includes("import") || m.includes("export") || m.includes("net meter") || m.includes("feed") || m.includes("ग्रिड") || m.includes("महावितरण")) {
    const gridVal = live?.grid ?? 0.0;
    const netVal = live?.gridNet ?? 0.0;
    if (isHi) return `ग्रिड स्थिति: वर्तमान ग्रिड आयात **${gridVal} kW** है (नेट ग्रिड प्रवाह: **${netVal > 0 ? `+${netVal} kW निर्यात` : `${netVal} kW आयात`}**)।`;
    if (isMr) return `ग्रिड स्थिती: सध्या ग्रिड आयात **${gridVal} kW** आहे (नेट ग्रिड प्रवाह: **${netVal > 0 ? `+${netVal} kW निर्यात` : `${netVal} kW आयात`}**)।`;
    return `Grid status: Grid import is currently **${gridVal} kW** (net flow is **${netVal >= 0 ? `+${netVal} kW exporting` : `${netVal} kW importing`}**).`;
  }

  // 9. Inverter & Electrical Telemetry (Voltage, Frequency, Efficiency)
  if (m.includes("inverter") || m.includes("voltage") || m.includes("frequency") || m.includes("efficiency") || m.includes("volt") || m.includes("इन्वर्टर") || m.includes("वोल्टेज") || m.includes("दक्षता")) {
    const volt = live?.acVoltage ?? 230.0;
    const freq = live?.acFrequency ?? 50.0;
    const eff = live?.efficiency ?? 98.2;
    if (isHi) return `इन्वर्टर टेलीमेट्री: एसी वोल्टेज **${volt} V**, आवृत्ति **${freq} Hz**, और परिचालन दक्षता **${eff}%** पर सामान्य रूप से काम कर रही है।`;
    if (isMr) return `इन्व्हर्टर टेलीमेट्री: एसी व्होल्टेज **${volt} V**, वारंवारता **${freq} Hz**, आणि कार्यक्षमता **${eff}%** वर स्थिर चालू आहे।`;
    return `Inverter Telemetry: AC Voltage is **${volt} V**, Frequency is **${freq} Hz**, and Inverter Efficiency is **${eff}%**.`;
  }

  // 10. Weather, Irradiance & Temperature
  if (m.includes("irradiance") || m.includes("sun") || m.includes("weather") || m.includes("temp") || m.includes("heat") || m.includes("धूप") || m.includes("मौसम") || m.includes("तापमान") || m.includes("हवामान")) {
    const irr = live?.irradiance ?? 820;
    const temp = live?.panelTemp ?? 32.4;
    if (isHi) return `मौसम और तापमान: सौर विकिरण **${irr} W/m²** है और पैनल का तापमान **${temp}°C** पर अनुकूल है।`;
    if (isMr) return `हवामान आणि तापमान: सौर विकिरण **${irr} W/m²** आहे आणि पॅनेलचे तापमान **${temp}°C** वर योग्य आहे।`;
    return `Weather & Thermal Field: Solar Irradiance is **${irr} W/m²** and Panel Temperature is **${temp}°C**.`;
  }

  // 11. Forecast / Tomorrow / Future Generation
  if (m.includes("forecast") || m.includes("tomorrow") || m.includes("future") || m.includes("predict") || m.includes("कल") || m.includes("उद्या") || m.includes("अंदाज")) {
    if (isHi) return `कल का सौर पूर्वानुमान: अनुकूल मौसम और उच्च विकिरण के साथ कल लगभग **41.8 kWh** उत्पादन होने की उम्मीद है।`;
    if (isMr) return `उद्याचा सौर अंदाज: चांगल्या सूर्यप्रकाशामुळे उद्या सुमारे **41.8 kWh** निर्मिती अपेक्षित आहे।`;
    return `Solar Yield Forecast: Tomorrow is projected to generate approximately **41.8 kWh** under high solar irradiance.`;
  }

  // 12. Monthly Generation & Savings
  if (m.includes("month") || m.includes("save") || m.includes("saving") || m.includes("money") || m.includes("bill") || m.includes("cost") || m.includes("tariff") ||
      m.includes("महीना") || m.includes("महिना") || m.includes("बचत") || m.includes("पैसे") || m.includes("बिल") || m.includes("रुपये")) {
    if (isHi) {
      return `आपने इस महीने अब तक **${monthly.monthGeneratedKWh} kWh** सौर ऊर्जा का उत्पादन किया है, जिससे कुल **₹${monthly.savings.toLocaleString("en-IN")}** की बचत हुई है!`;
    }
    if (isMr) {
      return `तुम्ही या महिन्यात आतापर्यंत **${monthly.monthGeneratedKWh} kWh** सौर ऊर्जेची निर्मिती केली आहे, ज्यामुळे **₹${monthly.savings.toLocaleString("en-IN")}** ची बचत झाली आहे!`;
    }
    return `So far this month, your solar system has generated **${monthly.monthGeneratedKWh} kWh**, saving you **₹${monthly.savings.toLocaleString("en-IN")}** on your electricity bill and avoiding **${monthly.co2AvoidedKg} kg** of CO₂ emissions.`;
  }

  // 13. Panel Maintenance & Cleaning
  if (m.includes("clean") || m.includes("dust") || m.includes("soiling") || m.includes("maintenance") ||
      m.includes("साफ") || m.includes("सफाई") || m.includes("धूल")) {
    if (isHi) return "धूल और गंदगी सौर अवशोषण को 12% से 25% तक कम कर सकती है। हम आपके सौर पैनलों को हर 3 से 4 सप्ताह में एक बार सुबह जल्दी साफ पानी और एक नरम निचोड़ के साथ साफ करने की सलाह देते हैं।";
    if (isMr) return "धूळ आणि घाण सौर शोषण १२% ते २५% कमी करू शकतात। आम्ही शिफारस करतो की तुम्ही तुमच्या सौर पॅनेल्सची स्वच्छता दर ३ ते ४ आठवड्यांनी एकदा सकाळी लवकर स्वच्छ पाणी आणि मऊ कापडाने करावी।";
    return "Dust, bird droppings, and soiling can reduce solar absorption by 12% to 25%. We recommend cleaning your solar panels with clean water and a soft squeegee once every 3 to 4 weeks early in the morning before panels get hot.";
  }

  // 14. Carbon & Environment
  if (m.includes("co2") || m.includes("carbon") || m.includes("environment") || m.includes("tree") || m.includes("green") || m.includes("पर्यावरण") || m.includes("पेड़") || m.includes("झाडे")) {
    if (isHi) return `आपने इस महीने लगभग ${monthly.co2AvoidedKg} किलो CO₂ बचाया है — जो प्रति वर्ष लगभग ${monthly.treesPerYear} पेड़ों के बराबर है।`;
    if (isMr) return `तुम्ही या महिन्यात सुमारे ${monthly.co2AvoidedKg} किलो CO₂ वाचवला आहे — जे प्रति वर्ष सुमारे ${monthly.treesPerYear} झाडांच्या बरोबरीचे आहे।`;
    return `You've avoided about ${monthly.co2AvoidedKg} kg of CO₂ this month — roughly equivalent to ${monthly.treesPerYear} trees over a year.`;
  }

  // 15. System Health & Diagnostics
  if (m.includes("health") || m.includes("status") || m.includes("ok") || m.includes("fine") || m.includes("yesterday") || m.includes("fault") || m.includes("problem") || m.includes("आरोग्य") || m.includes("स्थिति") || m.includes("खराबी")) {
    const score = healthScore ?? 100;
    if (scenario.id === "normal") {
      if (isHi) return `आपका सिस्टम **${score}/100** स्कोर के साथ पूरी तरह स्वस्थ है और उत्पादन अपेक्षित वक्र के करीब चल रहा है।`;
      if (isMr) return `तुमची प्रणाली **${score}/100** स्कोरसह निरोगी आहे आणि निर्मिती अपेक्षित वक्राच्या जवळ चालू आहे।`;
      return `Your system is fully healthy with a **${score}/100** health score — production is tracking the clear-sky curve.`;
    }
    return `System Status: ${scenario.insight?.title ?? "Health Alert"} — ${scenario.insight?.body ?? "Shortfall detected."}`;
  }

  // 16. Intelligent Live System Overview Fallback
  const solNow = live?.solar ?? 4.72;
  const loadNow = live?.home ?? 2.10;
  const battNow = live?.battery ?? 76;
  const score = healthScore ?? 100;
  if (isHi) {
    return `सोलर सिस्टम की वर्तमान स्थिति: सौर उत्पादन **${solNow} kW**, घर का लोड **${loadNow} kW**, बैटरी **${battNow}%**, और स्वास्थ्य स्कोर **${score}/100** है। आप सौर उत्पादन, बैटरी चार्ज, बचत, पूर्वानुमान या उपकरण शेड्यूलिंग के बारे में कुछ भी पूछ सकते हैं!`;
  }
  if (isMr) {
    return `सोलर सिस्टीमची सद्यस्थिती: सौर निर्मिती **${solNow} kW**, घराचा लोड **${loadNow} kW**, बॅटरी **${battNow}%**, आणि आरोग्य स्कोर **${score}/100** आहे। तुम्ही सौर उत्पादन, बॅटरी चार्ज, बचत, अंदाज किंवा उपकरणे चालवण्याबद्दल कोणताही प्रश्न विचारू शकता!`;
  }
  return `Here is your live SolarSense status: Solar generation is **${solNow} kW**, home load is **${loadNow} kW**, battery storage is at **${battNow}%**, and today's health score is **${score}/100**. Ask any question about your solar telemetry, battery charge, savings, or appliance scheduling!`;
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

