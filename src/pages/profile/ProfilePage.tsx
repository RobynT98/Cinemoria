// src/pages/profile/ProfilePage.tsx

import { exportJson, importJson, wipeAll } from "@/lib/backup";
import { useEffect, useRef, useState } from "react";
// ... (övriga imports)

const APP_VERSION = "1.0.0";

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { theme, setTheme } = useThemeStore();

  // i18n
  const { i18n, t } = useTranslation();
  // STABIL: Läser språket direkt. Denna triggar INTE rendering, men den kraschar INTE.
  const lang = (i18n.language || "sv").split("-")[0] as "sv" | "en"; 
  
  const switchLang = (lng: "sv" | "en") => {
    // Byter språk. Detta får T-funktionen att uppdatera texten i appen.
    if (lng !== lang) i18n.changeLanguage(lng);
  };

  // <<<<<<<<< VIKTIGT: DEN KRASCHANDE useEffect FÖR I18N ÄR BORTTAGEN >>>>>>>>>

  // PWA install
  // ... (resten av koden)
  // ...
  
  return (
    // ... (resten av JSX, som nu kommer att visas utan krasch)
    
      {/* Språk */}
      <div className="card p-4 space-y-3">
        {/* ... */}
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn ${lang === "sv" ? "btn-primary" : ""}`} // Markeringen kommer vara fördröjd
            onClick={() => switchLang("sv")}
            aria-pressed={lang === "sv"}
          >
            {t("profile.language.sv", "Svenska")}
          </button>
          {/* ... */}
        </div>
      </div>
    // ...
  );
}
