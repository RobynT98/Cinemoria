// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Minimal setup:
 * - språk kodas med 'sv' eller 'en'
 * - läser/sparar val till localStorage ('cm_lang')
 * - fallback: svenska
 *
 * Du kan fylla på "resources" allt eftersom.
 */
const saved =
  (typeof window !== "undefined" &&
    (localStorage.getItem("cm_lang") as "sv" | "en" | null)) || null;

const guess =
  typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("sv")
    ? "sv"
    : "en";

const startLng: "sv" | "en" = (saved || guess) as "sv" | "en";

i18n
  .use(initReactI18next)
  .init({
    lng: startLng,
    fallbackLng: "sv",
    interpolation: { escapeValue: false },
    resources: {
      sv: {
        translation: {
          // Exempelnycklar (använd om/när du börjar översätta):
          profile: {
            language: {
              title: "Språk",
              hint: "Byt appens språk. Valet sparas lokalt.",
              sv: "Svenska",
              en: "English"
            }
          }
        }
      },
      en: {
        translation: {
          profile: {
            language: {
              title: "Language",
              hint: "Switch the app language. Saved locally.",
              sv: "Swedish",
              en: "English"
            }
          }
        }
      }
    }
  });

// Hjälpare: spara varje changeLanguage i localStorage
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("cm_lang", lng);
    // Just in case: uppdatera html lang-attribut
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lng);
    }
  } catch {}
});

export default i18n;