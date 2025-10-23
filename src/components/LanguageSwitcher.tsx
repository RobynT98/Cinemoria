import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "sv");

  useEffect(() => {
    i18n.changeLanguage(lang);
    try { localStorage.setItem("cm_lang", lang); } catch {}
  }, [lang, i18n]);

  return (
    <div className="space-y-2">
      <div className="font-medium">{t("profile.language.title")}</div>
      <p className="text-sand-300 text-sm">{t("profile.language.help")}</p>
      <div className="flex gap-2">
        <button
          className={`btn ${lang === "sv" ? "btn-primary" : ""}`}
          onClick={() => setLang("sv")}
        >
          {t("profile.language.sv")}
        </button>
        <button
          className={`btn ${lang === "en" ? "btn-primary" : ""}`}
          onClick={() => setLang("en")}
        >
          {t("profile.language.en")}
        </button>
      </div>
    </div>
  );
}