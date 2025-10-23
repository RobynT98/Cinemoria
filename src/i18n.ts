// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import sv from "./locales/sv/translation.json";
import en from "./locales/en/translation.json";

// Plocka sparat språk eller webbläsarens
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
    lng: saved || browser || "sv",
    fallbackLng: "sv",

    ns: ["translation"],
    defaultNS: "translation",

    interpolation: { escapeValue: false },

    // 🔎 Hjälp för saknade översättningsnycklar
    saveMissing: true, // aktiverar “missing”-flödet
    missingKeyHandler: (lng, ns, key) => {
      // Logga tydligt i konsolen när en key saknas
      if (typeof window !== "undefined" && console?.warn) {
        console.warn("[i18n missing]", { lng, ns, key });
      }
    },

    // Visa nyckeln i UI när den saknas – praktiskt på mobil.
    // Görs bara i DEV så slutanvändare slipper se det.
    parseMissingKeyHandler: (key) =>
      (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV)
        ? `⛳ ${key}`
        : key,

    // Vill du slippa Suspense? Avkommentera:
    // react: { useSuspense: false },
  });

// Spara valt språk lokalt
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("cm_lang", lng);
  } catch {}
});

export default i18n;