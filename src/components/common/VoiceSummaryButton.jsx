import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp, Play, Square } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function VoiceSummaryButton() {
  const { live, healthScore, scenario, anomalyActive } = useSimulation();
  const { language, t } = useLanguage();

  const [speaking, setSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState("");
  const synthRef = useRef(window.speechSynthesis || null);

  // Stop speech and reset transcript when language changes
  useEffect(() => {
    setTranscript("");
    setSpeaking(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, [language]);

  // Construct text summary dynamically based on current live state & language
  const generateSummaryText = () => {
    if (!live) return "";

    const solar = live.solar ?? 0;
    const home = live.home ?? 0;
    const battery = live.battery ?? 50;
    const gridNet = live.gridNet ?? 0;
    const health = healthScore ?? 100;

    if (language === "hi") {
      let text = `नमस्कार! सोलर-सेंस एआई ब्रीफिंग में आपका स्वागत है। वर्तमान में सौर उत्पादन ${solar} किलोवाट है, और घरेलू बिजली की खपत ${home} किलोवाट है। `;
      text += `आपकी बैटरी स्टोरेज ${battery} प्रतिशत चार्ज है। `;

      if (gridNet > 0) {
        text += `आप ग्रिड को ${gridNet.toFixed(1)} किलोवाट बिजली निर्यात कर रहे हैं। `;
      } else if (gridNet < 0) {
        text += `आप ग्रिड से ${Math.abs(gridNet).toFixed(1)} किलोवाट बिजली आयात कर रहे हैं। `;
      }

      text += `आपकी सौर प्रणाली का स्वास्थ्य स्कोर 100 में से ${health} है। `;

      if (anomalyActive) {
        text += `सावधान! ${scenario?.label || "उत्पादन में विसंगति"} पाई गई है। `;
      } else {
        text += `आपकी सौर प्रणाली सामान्य और सुचारू रूप से कार्य कर रही है। `;
      }

      if (solar > home) {
        text += `यह कपड़े धोने या ईवी चार्ज करने का सही समय है!`;
      } else {
        text += `बैटरी बचाने के लिए भारी उपकरणों का उपयोग कम करें।`;
      }

      return text;
    }

    if (language === "mr") {
      let text = `नमस्कार! सोलर-सेन्स एआय ब्रीफिंगमध्ये आपले स्वागत आहे. सध्या सौर ऊर्जा निर्मिती ${solar} किलोवॉट आहे, आणि घरगुती वापर ${home} किलोवॉट आहे. `;
      text += `आपली बॅटरी क्षमता ${battery} टक्के चार्ज आहे. `;

      if (gridNet > 0) {
        text += `आपण ग्रिडला ${gridNet.toFixed(1)} किलोवॉट वीज विकत आहात. `;
      } else if (gridNet < 0) {
        text += `आपण ग्रिडकडून ${Math.abs(gridNet).toFixed(1)} किलोवॉट वीज घेत आहात. `;
      }

      text += `आपल्या सोलर सिस्टीमचे आरोग्य गुण 100 पैकी ${health} आहे. `;

      if (anomalyActive) {
        text += `लक्ष द्या! ${scenario?.label || "उत्पादनात तफावत"} आढळली आहे. `;
      } else {
        text += `आपली सौर प्रणाली उत्तम प्रकारे कार्यरत आहे. `;
      }

      if (solar > home) {
        text += `उच्च क्षमतेची उपकरणे चालवण्यासाठी ही सर्वोत्तम वेळ आहे!`;
      } else {
        text += `बॅटरी बचतीसाठी अनावश्यक वीज वापर टाळा.`;
      }

      return text;
    }

    // Default: English
    let text = `Hello! Welcome to your SolarSense AI briefing. Currently, solar generation is ${solar} kilowatts, and home load is ${home} kilowatts. `;
    text += `Your battery is at ${battery} percent capacity. `;

    if (gridNet > 0) {
      text += `You are exporting ${gridNet.toFixed(1)} kilowatts to the grid. `;
    } else if (gridNet < 0) {
      text += `You are importing ${Math.abs(gridNet).toFixed(1)} kilowatts from the grid. `;
    }

    text += `Your solar system health score is ${health} out of 100. `;

    if (anomalyActive) {
      text += `Alert: ${scenario?.label || "A production anomaly"} is currently active. `;
    } else {
      text += `Your system is running smoothly on clear sky baseline. `;
    }

    if (solar > home) {
      text += `Great time to schedule heavy appliances!`;
    } else {
      text += `Consider conserving power to maintain battery backup.`;
    }

    return text;
  };

  const handleSpeakToggle = () => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }

    const textToSpeak = generateSummaryText();
    setTranscript(textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Language voice mapping & explicit browser voice selection
    try {
      const voices = synthRef.current.getVoices() || [];
      let selectedVoice = null;

      if (language === "hi") {
        utterance.lang = "hi-IN";
        selectedVoice = voices.find((v) => v.lang === "hi-IN" || v.lang.startsWith("hi"));
      } else if (language === "mr") {
        utterance.lang = "mr-IN";
        selectedVoice = voices.find((v) => v.lang === "mr-IN" || v.lang.startsWith("mr"));
      } else {
        utterance.lang = "en-IN";
        selectedVoice = voices.find((v) => v.lang === "en-IN" || v.lang.startsWith("en"));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } catch (err) {
      console.warn("[VoiceSummary] Voice selection failed:", err);
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.cancel(); // clear previous
    synthRef.current.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255, 153, 51, 0.08), rgba(31, 174, 92, 0.06))",
        border: "1px solid var(--hairline)",
        borderRadius: 14,
        padding: "12px 16px",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        {/* Left Info Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 153, 51, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} color="var(--saffron)" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--ink-100)" }}>
              {t("voice_briefing_title", "AI Voice Audio Briefing")}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>
              {t("voice_briefing_sub", "Listen to live status, generation stats & recommendations")}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={handleSpeakToggle}
            className="ss-chip"
            data-active={speaking || undefined}
            style={{
              background: speaking ? "var(--saffron)" : "var(--saffron-deep)",
              color: "#ffffff",
              border: "none",
              padding: "7px 14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: speaking ? "0 0 12px rgba(255, 153, 51, 0.6)" : "none",
            }}
          >
            {speaking ? <Square size={14} fill="#ffffff" /> : <Play size={14} fill="#ffffff" />}
            <span>{speaking ? t("btn_stop_audio", "Stop Briefing") : t("btn_play_audio", "Listen Now")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!transcript) setTranscript(generateSummaryText());
              setShowTranscript(!showTranscript);
            }}
            className="ss-btn-ghost"
            style={{ padding: "6px 10px", fontSize: 11 }}
            title={t("btn_transcript", "View Transcript")}
          >
            {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable Transcript Box */}
      {showTranscript && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px dashed var(--hairline)",
            fontSize: 12,
            color: "var(--ink-300)",
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 11, color: "var(--saffron)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🗣️ {t("transcript_label", "Audio Transcript")} ({language.toUpperCase()})
          </div>
          {transcript || generateSummaryText()}
        </div>
      )}
    </div>
  );
}
