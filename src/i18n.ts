// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Ladda in JSON-resurser (Vite låter oss importera json direkt)
import sv from "./locales/sv/translation.json";
import en from "./locales/en/translation.json";

const saved =
  (typeof window !== "undefined" && localStorage.getItem("cm_lang")) || undefined;
const browser =
  typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "sv";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: sv },
      en: { translation: en },
    },
    lng: saved || (browser === "en" ? "en" : "sv"),
    fallbackLng: "sv",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    
    // ✅ FIX FÖR TIMING/RACE CONDITION (Hänvisar till Suspense i App.tsx)
    react: {
        useSuspense: true, 
    },
    // Säkerställ att vi använder standard-namespace korrekt
    ns: ['translation'],
    defaultNS: 'translation',
  });

// Spara språkbyte lokalt
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("cm_lang", lng);
  } catch {}
});

export default i18n;
