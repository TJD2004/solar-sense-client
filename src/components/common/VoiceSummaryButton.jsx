import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp, Play, Square } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { API_BASE_URL } from "../../services/api.js";

export default function VoiceSummaryButton() {
  const { live, healthScore, scenario, anomalyActive } = useSimulation();
  const { language, t } = useLanguage();

  const [speaking, setSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState("");
  const synthRef = useRef(window.speechSynthesis || null);
  const audioRef = useRef(null);

  // Stop speech and reset transcript when language changes
  useEffect(() => {
    setTranscript("");
    setSpeaking(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (e) {
        // Ignore audio pause errors
      }
      audioRef.current = null;
    }
  }, [language]);

  // Prefetch voices on component mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

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

  const playLocalFallback = (text) => {
    if (!synthRef.current) {
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    try {
      const voices = synthRef.current.getVoices() || [];
      let selectedVoice = null;

      if (language === "hi") {
        utterance.lang = "hi-IN";
        const hiVoices = voices.filter((v) => v.lang === "hi-IN" || v.lang.toLowerCase().startsWith("hi"));
        selectedVoice = hiVoices.find((v) => 
          v.name.includes("Swara") || 
          v.name.includes("Kalpana") || 
          v.name.toLowerCase().includes("female") || 
          v.name.includes("Google")
        ) || hiVoices[0] || null;
      } else if (language === "mr") {
        utterance.lang = "mr-IN";
        const mrVoices = voices.filter((v) => v.lang === "mr-IN" || v.lang.toLowerCase().startsWith("mr"));
        selectedVoice = mrVoices.find((v) => 
          v.name.includes("Aarohi") || 
          v.name.toLowerCase().includes("female") || 
          v.name.includes("Google")
        ) || mrVoices[0] || null;
      } else {
        utterance.lang = "en-IN";
        const enVoices = voices.filter((v) => v.lang === "en-IN" || v.lang.toLowerCase().startsWith("en"));
        selectedVoice = enVoices.find((v) => 
          v.name.includes("Heera") || 
          v.name.includes("Zira") || 
          v.name.toLowerCase().includes("female") || 
          v.name.includes("Google")
        ) || enVoices[0] || null;
      }

      if (selectedVoice) {
        console.log(`[VoiceSummary] Fallback selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        utterance.voice = selectedVoice;
      }
    } catch (err) {
      console.warn("[VoiceSummary] Fallback voice selection failed:", err);
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
    setSpeaking(true);
  };

  const handleSpeakToggle = () => {
    // 1. If currently speaking, stop everything (local speech and Audio elements)
    if (speaking) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {
          // Ignore pause errors
        }
        audioRef.current = null;
      }
      setSpeaking(false);
      return;
    }

    const textToSpeak = generateSummaryText();
    setTranscript(textToSpeak);

    // 2. Play using Google Translate TTS API for natural, human-like female neural voice
    const langCode = language === "hi" ? "hi" : language === "mr" ? "mr" : "en";
    
    // Split text into short chunks for the Google TTS limit (approx 200 chars)
    // We split by punctuation (। , . ! ?) so sentences are read cleanly with pauses.
    const sentences = textToSpeak.split(/[।\.!\?]/).map((s) => s.trim()).filter((s) => s.length > 0);
    
    if (sentences.length > 0) {
      setSpeaking(true);
      let index = 0;
      
      const playNext = () => {
        // If user stopped speech during play, terminate sequence
        if (audioRef.current === null && index > 0) {
          setSpeaking(false);
          return;
        }

        if (index >= sentences.length) {
          setSpeaking(false);
          return;
        }

        const sentence = sentences[index];
        const url = `${API_BASE_URL}/api/ai/tts?text=${encodeURIComponent(sentence)}&lang=${langCode}`;
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          index++;
          playNext();
        };

        audio.onerror = (e) => {
          console.warn("[VoiceSummary] Google TTS segment failed. Falling back to local synthesis:", e);
          playLocalFallback(textToSpeak);
        };

        audio.play().catch((err) => {
          console.warn("[VoiceSummary] Audio play call failed. Falling back to local synthesis:", err);
          playLocalFallback(textToSpeak);
        });
      };

      playNext();
    } else {
      playLocalFallback(textToSpeak);
    }
  };

  return (
    <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.08)] mb-6 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left Info Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              {t("voice_briefing_title", "AI Voice Audio Briefing")}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("voice_briefing_sub", "Listen to live status, generation stats & recommendations")}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakToggle}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm ${
              speaking
                ? "bg-rose-600 text-white shadow-rose-200 animate-pulse"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
            }`}

          >
            {speaking ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span className="tracking-wide">{speaking ? t("btn_stop_audio", "Stop Briefing") : t("btn_play_audio", "Listen Now")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!transcript) setTranscript(generateSummaryText());
              setShowTranscript(!showTranscript);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
            title={t("btn_transcript", "View Transcript")}
          >
            {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Transcript Box */}
      {showTranscript && (
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-medium space-y-1">
          <div className="font-extrabold text-[11px] text-amber-600 uppercase tracking-wider font-display">
            🗣️ {t("transcript_label", "Audio Transcript")} ({language.toUpperCase()})
          </div>
          <p>{transcript || generateSummaryText()}</p>
        </div>
      )}
    </div>
  );

}
