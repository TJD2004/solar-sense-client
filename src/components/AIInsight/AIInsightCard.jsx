import React from "react";
import { Sparkles, Brain, Bot, CheckCircle } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

const INSIGHT_TRANSLATIONS = {
  hi: {
    title: "एआई सेंस प्रदर्शन विश्लेषक",
    normal_body: "आज के मौसम और समय के लिए उत्पादन अपेक्षित स्तरों के बहुत करीब चल रहा है। यदि उत्पादन पूर्वानुमान से नीचे गिरता है, तो यह पैनल केवल संख्या दिखाने के बजाय संभावित कारकों — बादलों का छाना, छाया या धूल — की व्याख्या करेगा।",
    normal_tags: ["✅ सामान्य प्रदर्शन", "☀️ स्पष्ट आसमान", "⚡ 100% स्वास्थ्य"],
    cloudy_body: "आउटपुट में 10:00 और 15:00 के बीच कई तीव्र, अस्थायी गिरावट दिखाई देती है। यह उतार-चढ़ाव वाला पैटर्न हार्डवेयर की गिरावट के बजाय गुजरते बादलों के आवरण से मेल खाता है।",
    cloudy_tags: ["☁️ बादल छाना - उच्च संभावना", "🌡️ पैनल धूल - संभावना नहीं", "⚠️ इन्वर्टर फॉल्ट - संभावना नहीं"],
    shading_body: "सुबह का कर्व सामान्य रहने के दौरान हर दोपहर 14:00–17:00 विंडो में आउटपुट तेजी से गिरता है। यह समय-बद्ध पैटर्न निश्चित छायांकन की ओर इशारा करता है।",
    shading_tags: ["🌳 दोपहर की छाया - संभावित कारण", "☁️ बादल छाना - संभावना नहीं", "🧹 पैनल धूल - संभावना नहीं"],
    soiling_body: "बिना किसी अचानक गिरावट के पूरे दिन आउटपुट अपेक्षा से थोड़ा कम है। इस तरह की धीमी, समान गिरावट धूल के जमने के कारण होती है — पैनल की सफाई की सिफारिश की जाती है।",
    soiling_tags: ["🧹 पैनल धूल - संभावित कारण", "☁️ बादल छाना - संभावना नहीं", "🌳 छाया - संभावना नहीं"],
    inverter_body: "12:00 के बाद एक ही अंतराल के भीतर आउटपुट तेजी से गिरा है और उबर नहीं पाया है। यह अचानक, निरंतर गिरावट इन्वर्टर या कनेक्शन फॉल्ट के अनुरूप है।",
    inverter_tags: ["⚠️ इन्वर्टर फॉल्ट - संभव, हार्डवेयर जांचें", "☁️ बादल छाना - संभावना नहीं", "🧹 धूल - संभावना नहीं"],
  },
  mr: {
    title: "एआई सेन्स कामगिरी विश्लेषक",
    normal_body: "आजच्या हवामानासाठी आणि वेळेसाठी निर्मिती अपेक्षित पातळीच्या जवळ सुरू आहे. जर निर्मिती अंदाजापेक्षा खाली घसरली, तर हे पॅनेल केवळ संख्या दाखवण्याऐवजी संभाव्य कारणे — ढगाळ वातावरण, सावली किंवा धूळ — स्पष्ट करेल.",
    normal_tags: ["✅ सामान्य कामगिरी", "☀️ निरभ्र आकाश", "⚡ 100% आरोग्य"],
    cloudy_body: "आउटपुटमध्ये 10:00 आणि 15:00 दरम्यान अनेक तीव्र, तात्पुरत्या घसरणी दिसतात. हा चढ-उताराचा नमुना हार्डवेअरच्या बिघाडाऐवजी ढगाळ वातावरणाशी जुळतो.",
    cloudy_tags: ["☁️ ढगाळ वातावरण - उच्च शक्यता", "🌡️ पॅनेल धूळ - शक्यता नाही", "⚠️ इनव्हर्टर दोष - शक्यता नाही"],
    shading_body: "सकाळचा आलेख सामान्य असताना दररोज दुपारी 14:00-17:00 च्या वेळेत आउटपुट वेगाने घसरते. हा ठराविक वेळेतील नमुना निश्चित सावलीकडे निर्देश करतो.",
    shading_tags: ["🌳 दुपारची सावली - संभाव्य कारण", "☁️ ढगाळ वातावरण - शक्यता नाही", "🧹 पॅनेल धूळ - शक्यता नाही"],
    soiling_body: "कोणत्याही अचानक घसरणीशिवाय दिवसभर आउटपुट अपेक्षेपेक्षा थोडे कमी आहे. अशी संथ, एकसमान घट धुळीच्या साचण्यामुळे होते — पॅनेल साफ करण्याची शिफारस केली जाते.",
    soiling_tags: ["🧹 पॅनेल धूळ - संभाव्य कारण", "☁️ ढगाळ वातावरण - शक्यता नाही", "🌳 सावली - शक्यता नाही"],
    inverter_body: "12:00 नंतर एकाच अंतराळात आउटपुट वेगाने घसरले आहे आणि सुधारलेले नाही. ही अचानक, सततची घट इनव्हर्टर किंवा कनेक्शन दोषाशी जुळते.",
    inverter_tags: ["⚠️ इनव्हर्टर दोष - शक्य, हार्डवेअर तपासा", "☁️ ढगाळ वातावरण - शक्यता नाही", "🧹 धूळ - शक्यता नाही"],
  }
};

function formatGroqBody(text, lang) {
  if (lang === "en" || !text) return text || "";
  let translated = text;

  if (lang === "hi") {
    translated = translated
      .replace(/Your solar panel production is lower than expected today/gi, "आज आपका सौर ऊर्जा उत्पादन अपेक्षा से कम है")
      .replace(/with a health score of (\d+) out of 100/gi, "100 में से $1 के हेल्थ स्कोर के साथ")
      .replace(/This could be due to possible contributors such as cloud cover, shading from nearby objects, or soiling on the panels/gi, "यह बादलों के छाने, पास की वस्तुओं की छाया, या पैनलों पर जमा धूल के कारण हो सकता है")
      .replace(/which may be reducing the amount of sunlight they can absorb/gi, "जो उनके द्वारा अवशोषित सूर्य के प्रकाश को कम कर सकता है")
      .replace(/It's likely that one or more of these factors are affecting your system's performance/gi, "संभावना है कि इनमें से एक या अधिक कारक आपके सिस्टम के प्रदर्शन को प्रभावित कर रहे हैं")
      .replace(/further investigation would be needed to determine the exact cause/gi, "सटीक कारण का पता लगाने के लिए आगे की जाँच आवश्यक होगी");
  } else if (lang === "mr") {
    translated = translated
      .replace(/Your solar panel production is lower than expected today/gi, "आज तुमचे सौर ऊर्जा निर्मिती अपेक्षेपेक्षा कमी आहे")
      .replace(/with a health score of (\d+) out of 100/gi, "100 पैकी $1 आरोग्य गुणांसह")
      .replace(/This could be due to possible contributors such as cloud cover, shading from nearby objects, or soiling on the panels/gi, "हे ढगाळ वातावरण, जवळील सावली, किंवा पॅनेलवरील धुळीमुळे असू शकते")
      .replace(/which may be reducing the amount of sunlight they can absorb/gi, "ज्यामुळे ते शोषून घेऊ शकणारा सूर्यप्रकाश कमी होत असावा")
      .replace(/It's likely that one or more of these factors are affecting your system's performance/gi, "यापैकी एक किंवा अधिक घटक तुमच्या सिस्टमच्या कामगिरीवर परिणाम करत असण्याची शक्यता आहे")
      .replace(/further investigation would be needed to determine the exact cause/gi, "अचूक कारण शोधण्यासाठी सविस्तर तपासाची गरज असेल");
  }

  return translated;
}

export default function AIInsightCard({
  title = "AI Performance Detective",
  body = "Production is running close to expected levels for today's weather and time of year.",
  tags = ["☁️ Cloud cover", "🌳 Shading", "🧹 Soiling"],
  source,
  loading,
}) {
  const { language, t } = useLanguage();
  const langDict = INSIGHT_TRANSLATIONS[language];

  let displayTitle = t("ai_detective_title", title || "AI Performance Detective");
  let displayBody = body || "Production is running close to expected levels.";
  let displayTags = Array.isArray(tags) ? tags : ["☁️ Cloud cover", "🌳 Shading"];

  if (langDict && displayBody) {
    if (displayBody.includes("10:00") && displayBody.includes("15:00")) {
      displayBody = langDict.cloudy_body;
      displayTags = langDict.cloudy_tags;
    } else if (displayBody.includes("14:00–17:00") || displayBody.includes("14:00-17:00")) {
      displayBody = langDict.shading_body;
      displayTags = langDict.shading_tags;
    } else if (displayBody.includes("dust") || displayBody.includes("soiling") || displayBody.includes("slow")) {
      displayBody = langDict.soiling_body;
      displayTags = langDict.soiling_tags;
    } else if (displayBody.includes("12:00") || displayBody.includes("inverter")) {
      displayBody = langDict.inverter_body;
      displayTags = langDict.inverter_tags;
    } else if (displayBody.includes("close to expected")) {
      displayBody = langDict.normal_body;
      displayTags = langDict.normal_tags;
    } else {
      displayBody = formatGroqBody(displayBody, language);
    }
  }

  return (
    <div className="bg-white border-2 border-purple-500/80 rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.12)] flex items-start gap-4 transition-all">
      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
        <Sparkles className="w-5 h-5 stroke-[2.2]" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">{displayTitle}</h3>
            {source && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-mono-num">
                {source === "groq" ? "🧠 Llama-3 AI" : "⚙️ Diagnostic Heuristic"}
              </span>
            )}
          </div>
        </div>

        <p className={`text-xs text-slate-600 leading-relaxed font-medium transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
          {displayBody}
        </p>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {displayTags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/80 text-[11px] font-semibold">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
