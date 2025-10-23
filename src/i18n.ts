// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
    lng: saved || browser || "sv",
    fallbackLng: "sv",
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: { escapeValue: false },

    // 🔎 Lägg TILL dessa för att hitta saknade nycklar
    saveMissing: true, // aktiverar “missing”-flöde
    missingKeyHandler: (lng, ns, key) => {
      // Logga tydligt i konsolen när en key saknas
      if (typeof window !== "undefined") {
        // gruppera snyggt i dev-läge
        // @ts-ignore
        console.warn("[i18n missing]", { lng, ns, key });
      }
    },
    // Visa nyckeln i UI när den saknas (så du ser var)
    parseMissingKeyHandler: (key) => `⛳ ${key}`,
    
    // Om du inte vill att React väntar på Suspense:
    // react: { useSuspense: false },
  });

i18n.on("languageChanged", (lng) => {
  try { localStorage.setItem("cm_lang", lng); } catch {}
});

export default i18n;