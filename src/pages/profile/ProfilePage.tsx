// src/pages/profile/ProfilePage.tsx
import { exportJson, importJson, wipeAll } from "@/lib/backup";
import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { Link } from "react-router-dom";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "@/store/languageStore"; // <--- NY OCH KORREKT IMPORT

// Valfritt: kan ersättas med build-injektion senare
const APP_VERSION = "1.0.0";

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { theme, setTheme } = useThemeStore();

  // i18n
  const { t } = useTranslation(); 
  // Använd Zustand för att hämta språket och funktionen att byta.
  const { currentLang: baseLng, setLang: switchLang } = useLanguageStore(); 

  // ---- PWA Install state (via hook) ----
  const { isInstallable, installed, isIOS, install } = usePWAInstall();

  // ---- OMDb & Streckkod (localStorage-backed) ----
  const [omdbEnabled, setOmdbEnabled] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cm_omdb_enabled") === "1" : false
  );
  const [omdbKey, setOmdbKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cm_omdb_key") ?? "" : ""
  );
  const [omdbCheck, setOmdbCheck] = useState<null | "ok" | "fail" | "busy">(null);

  const [cameraStatus, setCameraStatus] = useState<null | "ok" | "denied" | "error" | "busy">(null);

  // ---- Feedback & delning ----
  const [copied, setCopied] = useState(false);
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : "";

  useEffect(() => {
    localStorage.setItem("cm_omdb_enabled", omdbEnabled ? "1" : "0");
  }, [omdbEnabled]);

  useEffect(() => {
    localStorage.setItem("cm_omdb_key", omdbKey || "");
  }, [omdbKey]);

  // ---- OMDb: snabb test ----
  async function testOmdb() {
    if (!omdbKey.trim()) {
      setOmdbCheck("fail");
      setMsg(t("profile.datafill.omdb.msg_need_key", "Ange en OMDb-nyckel först."));
      return;
    }
    try {
      setOmdbCheck("busy");
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(
        omdbKey.trim()
      )}&t=Inception&y=2010`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.Response === "True") {
        setOmdbCheck("ok");
        setMsg(t("profile.datafill.omdb.msg_ok", "OMDb OK – anslutning och nyckel verkar fungera."));
      } else {
        setOmdbCheck("fail");
        setMsg(
          `${t("profile.datafill.omdb.msg_error_prefix", "OMDb:")} ${
            json?.Error || t("unknown_error", "okänt fel")
          }`
        );
      }
    } catch (e: any) {
      setOmdbCheck("fail");
      setMsg(e?.message || t("profile.datafill.omdb.msg_network", "Kunde inte nå OMDb."));
    }
  }

  // ---- Kamera: snabb test ----
  async function testCamera() {
    try {
      setCameraStatus("busy");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
      setCameraStatus("ok");
      localStorage.setItem("cm_barcode_tested", "1");
      setMsg(t("profile.datafill.barcode.msg_ok", "Kamera OK – streckkodsskannern kan användas."));
    } catch (e: any) {
      try {
        const perm = await (navigator as any).permissions?.query({ name: "camera" });
        if (perm?.state === "denied") {
          setCameraStatus("denied");
          setMsg(
            t(
              "profile.datafill.barcode.msg_denied",
              "Kamera nekad. Tillåt kamera i webbläsarens inställningar."
            )
          );
          return;
        }
      } catch {}
      setCameraStatus("error");
      setMsg(e?.message || t("profile.datafill.barcode.msg_error", "Kunde inte öppna kameran."));
    }
  }

  // ---- Feedback helpers ----
  const buildFeedbackMailto = () => {
    const tech = [
      t("profile.feedback.placeholder", "Beskriv din feedback här..."),
      "",
      "--- Tekniskt (frivilligt, hjälper felsökning) ---",
      `Version: v${APP_VERSION}`,
      `Tema: ${theme}`,
      `Installerad (PWA): ${installed ? "ja" : "nej"}`,
      `Display-mode: ${
        window.matchMedia?.("(display-mode: standalone)")?.matches ? "standalone" : "browser"
      }`,
      `Språk: ${navigator.language}`,
      `UA: ${navigator.userAgent}`,
    ].join("\n");
    return `mailto:turessonrobyn@gmail.com?subject=${encodeURIComponent(
      "Cinemoria – feedback"
    )}&body=${encodeURIComponent(tech)}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMsg(t("profile.backup.copy_fail", "Kunde inte kopiera länken."));
    }
  };

  // ---- Backup / Export ----
  async function handleExport() {
    const data = await exportJson();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cinemoria-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Import ----
  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const res = await importJson(text);

      const {
        // Film
        addedMovies = 0,
        addedLists = 0,
        addedLinks = 0,
        // Böcker
        addedBooks = 0,
        addedBookLists = 0,
        addedBookLinks = 0,
        // Spel
        addedGames = 0,
        addedGameLists = 0,
        addedGameLinks = 0,
        // Album
        addedAlbums = 0,
        addedAlbumLists = 0,
        addedAlbumLinks = 0,
        // Serier
        addedComics = 0,
        addedComicLists = 0,
        addedComicLinks = 0,
      } = (res ?? {}) as any;

      const lines = [
        `• Filmer +${addedMovies}, Listor +${addedLists}, Film-kopplingar +${addedLinks}`,
        `• Böcker +${addedBooks}, Boklistor +${addedBookLists}, Bok-kopplingar +${addedBookLinks}`,
        `• Spel +${addedGames}, Spellistor +${addedGameLists}, Spel-kopplingar +${addedGameLinks}`,
        `• Album +${addedAlbums}, Albumlistor +${addedAlbumLists}, Album-kopplingar +${addedAlbumLinks}`,
        `• Serier +${addedComics}, Serielistor +${addedComicLists}, Serie-kopplingar +${addedComicLinks}`,
      ].join("\n");

      setMsg(`${t("profile.backup.import_done", "Import klar:")}\n\n${lines}`);
    } catch (e: any) {
      setMsg(e?.message || t("profile.backup.import_fail", "Import misslyckades"));
    }
  }

  async function handleWipe() {
    if (
      !confirm(
        t(
          "profile.backup.wipe_confirm",
          "Rensa all din data? (Filmer, listor, kopplingar, böcker, boklistor, spel, spellistor, album, albumlistor, serier och serielistor tas bort. Appen ligger kvar.)"
        )
      )
    ) {
      return;
    }
    await wipeAll();
    setMsg(t("profile.backup.wipe_done", "All data rensad."));
  }

  return (
    <section className="p-4 space-y-4">
      {/* Installera som app */}
      {!installed && (
        <>
          {isInstallable ? (
            <div className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {t("profile.install.title", "Installera som app")}
                  </h2>
                  <p className="text-sand-300 text-sm">
                    {t("profile.install.subtitle", "Fungerar offline och startar helskärm.")}
                  </p>
                </div>
                <button className="btn btn-primary" onClick={install}>
                  {t("profile.install.cta", "Installera")}
                </button>
              </div>
            </div>
          ) : isIOS ? (
            <div className="card p-4">
              <h2 className="font-semibold mb-1">
                {t("profile.install.iosTitle", "Installera på iPhone/iPad")}
              </h2>
              <p className="text-sand-300 text-sm">
                {t(
                  "profile.install.iosHint",
                  "Öppna delnings-menyn och välj “Lägg till på hemskärmen”."
                )}
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* Språk */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("profile.language.title", "Språk")}</h2>
        <p className="text-sand-300 text-sm">
          {t("profile.language.hint", "Byt appens språk. Valet sparas lokalt - under utveckling.")}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn ${baseLng === "sv" ? "btn-primary" : ""}`}
            onClick={() => switchLang("sv")}
            aria-pressed={baseLng === "sv"}
          >
            {t("profile.language.sv", "Svenska")}
          </button>
          <button
            className={`btn ${baseLng === "en" ? "btn-primary" : ""}`}
            onClick={() => switchLang("en")}
            aria-pressed={baseLng === "en"}
          >
            {t("profile.language.en", "English")}
          </button>
        </div>
      </div>

      {/* Tema */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("profile.theme.title", "Tema")}</h2>
        <p className="text-sand-300 text-sm">
          {t("profile.theme.hint", "Välj mellan mörkt, ljust eller sepia.")}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn ${theme === "dark" ? "btn-primary" : ""}`}
            onClick={() => setTheme("dark")}
          >
            {t("profile.theme.dark", "Mörkt")}
          </button>
          <button
            className={`btn ${theme === "light" ? "btn-primary" : ""}`}
            onClick={() => setTheme("light")}
          >
            {t("profile.theme.light", "Ljust")}
          </button>
          <button
            className={`btn ${theme === "sepia" ? "btn-primary" : ""}`}
            onClick={() => setTheme("sepia")}
          >
            {t("profile.theme.sepia", "Sepia")}
          </button>
        </div>
      </div>

      {/* Datakällor & Autofyll */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("profile.datafill.title", "Datakällor & Autofyll")}</h2>

        {/* OMDb */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={omdbEnabled}
                onChange={(e) => setOmdbEnabled(e.target.checked)}
              />
              {t("profile.datafill.omdb.use", "Använd OMDb för film-autofyll")}
            </label>
            <span
              className={
                omdbCheck === "ok"
                  ? "text-green-500 text-sm"
                  : omdbCheck === "fail"
                  ? "text-red-500 text-sm"
                  : omdbCheck === "busy"
                  ? "text-sand-300 text-sm"
                  : "text-sand-300 text-sm"
              }
            >
              {omdbCheck === "ok"
                ? t("profile.datafill.omdb.status_ok", "OK")
                : omdbCheck === "fail"
                ? t("profile.datafill.omdb.status_fail", "Fel")
                : omdbCheck === "busy"
                ? t("profile.datafill.omdb.status_busy", "Testar…")
                : t("profile.datafill.omdb.idle", "—")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <input
              type="password"
              value={omdbKey}
              onChange={(e) => setOmdbKey(e.target.value)}
              placeholder={t("profile.datafill.omdb.placeholder", "OMDb API-nyckel")}
              aria-label={t("profile.datafill.omdb.placeholder", "OMDb API-nyckel")}
            />
            <button className="btn" onClick={testOmdb} disabled={!omdbEnabled || !omdbKey.trim()}>
              {t("profile.datafill.omdb.test", "Testa OMDb")}
            </button>
          </div>

          <p className="text-sand-300 text-xs">
            {t(
              "profile.datafill.omdb.note",
              "Din OMDb-nyckel sparas endast lokalt i webbläsaren. När du lägger till eller redigerar en film kan appen använda nyckeln för att automatiskt hämta titel, poster och genrer via knappen Hämta från OMDb."
            )}
            <br />
            <span className="text-sand-400">
              {t(
                "profile.datafill.omdb.tip",
                "Tips: Klicka Testa OMDb ovan för att kontrollera att din nyckel fungerar."
              )}
            </span>
          </p>
        </div>

        <hr className="border-ink-700/30" />

        {/* Streckkod */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium">
                {t("profile.datafill.barcode.title", "Streckkodsskanning")}
              </div>
              <div className="text-sand-300 text-xs">
                {t(
                  "profile.datafill.barcode.hint",
                  "Testa kameratillstånd så att streckkodsskannern kan starta direkt i formulären."
                )}
                <br />
                <span className="text-sand-400">
                  {t(
                    "profile.datafill.barcode.tip",
                    "Tips: Om testet lyckas kan du skanna EAN, ISBN eller andra koder direkt när du lägger till film, bok, musik, serietidningar eller spel."
                  )}
                </span>
              </div>
            </div>
            <span
              className={
                cameraStatus === "ok"
                  ? "text-green-500 text-sm"
                  : cameraStatus === "denied" || cameraStatus === "error"
                  ? "text-red-500 text-sm"
                  : cameraStatus === "busy"
                  ? "text-sand-300 text-sm"
                  : "text-sand-300 text-sm"
              }
            >
              {cameraStatus === "ok"
                ? t("profile.datafill.barcode.ok", "Kamera OK")
                : cameraStatus === "denied"
                ? t("profile.datafill.barcode.denied", "Nekad")
                : cameraStatus === "error"
                ? t("profile.datafill.barcode.error", "Fel")
                : cameraStatus === "busy"
                ? t("profile.datafill.barcode.busy", "Testar…")
                : t("profile.datafill.barcode.idle", "—")}
            </span>
          </div>
          <button className="btn" onClick={testCamera}>
            {t("profile.datafill.barcode.test", "Testa kamera")}
          </button>
        </div>
      </div>

      {/* Backup */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("profile.backup.title", "Backup")}</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={handleExport}>
            {t("profile.backup.export", "Exportera JSON")}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            {t("profile.backup.import", "Importera JSON")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>
        {msg && (
          <div className="text-sand-300 text-sm whitespace-pre-line" aria-live="polite">
            {msg}
          </div>
        )}
      </div>

      {/* Feedback & delning */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("profile.feedback.title", "Feedback & delning")}</h2>
        <p className="text-sand-300 text-sm">
          {t(
            "profile.feedback.hint",
            "Skicka frivillig feedback eller dela appens länk. Ingen data skickas automatiskt."
          )}
        </p>
        <div className="flex gap-2 flex-wrap">
          <a href={buildFeedbackMailto()} className="btn">
            {t("profile.feedback.send", "Skicka feedback")}
          </a>
          <button className="btn" onClick={copyLink}>
            {copied ? t("profile.backup.copied", "Länk kopierad ✓") : t("profile.backup.copy", "Kopiera app-länk")}
          </button>
        </div>
      </div>

      {/* Hjälp */}
      <div className="card p-4">
        <h2 className="font-semibold mb-2">{t("profile.help.title", "Behöver du hjälp?")}</h2>
        <p className="text-sand-300 text-sm mb-2">
          {t("profile.help.hint", "Läs en kort guide med tips om hur du använder appen.")}
        </p>
        <Link to="/instructions" className="btn">
          {t("profile.help.cta", "Instruktioner")}
        </Link>
      </div>

      {/* Datahantering */}
      <div className="card p-4">
        <h2 className="font-semibold">{t("profile.backup.wipe_title", "Datahantering")}</h2>
        <p className="text-sand-300 text-sm mb-2">
          {t("profile.backup.wipe_hint", "Behöver du börja om från noll? Du kan rensa all lokal data.")}
        </p>
        <button className="btn" onClick={handleWipe}>
          {t("profile.backup.wipe_btn", "Rensa allt")}
        </button>
      </div>

      {/* Om-appen */}
      <div className="text-sand-300 text-sm">
        <ul className="list-disc pl-6 space-y-1">
          <li>
          Cinemoria V 2
          </li>
          <li>
            {t("profile.about.license", "© 2025 Conri Turesson — Licens: GNU GPL v3.0")} —{" "}
            <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">
              {t("profile.about.more", "mer info")}
            </a>.
          </li>
          <li>{t("profile.about.storage", "Lagring: Offline (IndexedDB). Ingen server krävs.")}</li>
          <li>{t("profile.about.platform", "Plattform: GitHub Pages.")}</li>
        </ul>
      </div>
    </section>
  );
}
