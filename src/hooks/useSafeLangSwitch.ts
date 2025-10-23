// src/hooks/useSafeLangSwitch.ts
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useSafeLangSwitch() {
  const { i18n, t } = useTranslation();
  
  // 1. STATE: Använd i18n.language som initialt värde för att garantera ett värde.
  const [currentLang, setCurrentLang] = useState(
      (i18n.language || "sv").split("-")[0] as "sv" | "en"
  );

  // 2. EFFECT: Lyssna på det globala i18n-eventet
  useEffect(() => {
    const getLang = (lng: string) => (lng || "sv").split("-")[0] as "sv" | "en";

    const handleLangChange = (lng: string) => {
      // Uppdatera lokal state när det globala språket ändras
      setCurrentLang(getLang(lng));
    };

    i18n.on("languageChanged", handleLangChange);

    // Initial synkronisering (säkerställer att den senaste finns)
    setCurrentLang(getLang(i18n.resolvedLanguage || i18n.language));

    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, [i18n]);

  const switchLang = (lng: "sv" | "en") => {
    if (lng !== currentLang) {
      i18n.changeLanguage(lng);
    }
  };

  return { currentLang, switchLang, t };
}
