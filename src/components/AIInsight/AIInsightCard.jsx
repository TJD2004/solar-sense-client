import React from "react";
import { Bot } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

const INSIGHT_TRANSLATIONS = {
  hi: {
    title: "एआई प्रदर्शन जासूस",
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
    title: "एआई कामगिरी शोधक",
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
  if (lang === "en" || !text) return text;
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

  let displayTitle = t("ai_detective_title", title);
  let displayBody = body;
  let displayTags = tags;

  if (langDict) {
    if (body.includes("10:00") && body.includes("15:00")) {
      displayBody = langDict.cloudy_body;
      displayTags = langDict.cloudy_tags;
    } else if (body.includes("14:00–17:00") || body.includes("14:00-17:00")) {
      displayBody = langDict.shading_body;
      displayTags = langDict.shading_tags;
    } else if (body.includes("dust") || body.includes("soiling") || body.includes("slow")) {
      displayBody = langDict.soiling_body;
      displayTags = langDict.soiling_tags;
    } else if (body.includes("12:00") || body.includes("inverter")) {
      displayBody = langDict.inverter_body;
      displayTags = langDict.inverter_tags;
    } else if (body.includes("close to expected")) {
      displayBody = langDict.normal_body;
      displayTags = langDict.normal_tags;
    } else {
      displayBody = formatGroqBody(body, language);
    }
  }

  return (
    <div className="panel insight-panel">
      <div className="insight-icon" style={{ background: "rgba(255,153,51,0.12)" }}>
        <Bot size={19} color="var(--saffron)" />
      </div>
      <div>
        <div className="insight-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {displayTitle}
          {source && (
            <span style={{ fontSize: 10, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              {source === "groq" ? "🧠 Groq" : "⚙️ Heuristic"}
            </span>
          )}
        </div>
        <div className="insight-body" style={{ opacity: loading ? 0.6 : 1, lineHeight: 1.5 }}>{displayBody}</div>
        <div className="insight-tags">
          {displayTags.map((tag) => (
            <span className="insight-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
