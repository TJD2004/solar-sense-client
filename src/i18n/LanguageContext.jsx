import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "./translations.js";

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("solarsense_lang");
      if (saved && translations[saved]) return saved;
    } catch {
      // localStorage error fallback
    }
    return "en";
  });

  const setLanguage = useCallback((langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem("solarsense_lang", langCode);
      } catch {
        // localStorage write fallback
      }
    }
  }, []);

  const t = useCallback(
    (key, fallbackStr = "") => {
      const langDict = translations[language] || translations.en;
      if (langDict[key] !== undefined) return langDict[key];
      if (translations.en[key] !== undefined) return translations.en[key];
      return fallbackStr || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
