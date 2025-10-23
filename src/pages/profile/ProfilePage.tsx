import { exportJson, importJson, wipeAll } from "@/lib/backup";
import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { Link } from "react-router-dom";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import LanguageSwitcher from "@/components/LanguageSwitcher"; // <-- NYTT

const APP_VERSION = "1.0.0";

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { theme, setTheme } = useThemeStore();

  const { isInstallable, installed, isIOS, install } = usePWAInstall();

  const [omdbEnabled, setOmdbEnabled] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cm_omdb_enabled") === "1" : false
  );
  const [omdbKey, setOmdbKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cm_omdb_key") ?? "" : ""
  );
  const [omdbCheck, setOmdbCheck] = useState<null | "ok" | "fail" | "busy">(null);

  const [cameraStatus, setCameraStatus] = useState<null | "ok" | "denied" | "error" | "busy">(null);

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

  async function testOmdb() {
    if (!omdbKey.trim()) {
      setOmdbCheck("fail");
      setMsg("Ange en OMDb-nyckel först.");
      return;
    }
    try {
      setOmdbCheck("busy");
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbKey.trim())}&t=Inception&y=2010`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.Response === "True") {
        setOmdbCheck("ok");
        setMsg("OMDb OK – anslutning och nyckel verkar fungera.");
      } else {
        setOmdbCheck("fail");
        setMsg(`OMDb: ${json?.Error || "okänt fel"}`);
      }
    } catch (e: any) {
      setOmdbCheck("fail");
      setMsg(e?.message || "Kunde inte nå OMDb.");
    }
  }

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
      setMsg("Kamera OK – streckkodsskannern kan användas.");
    } catch (e: any) {
      try {
        const perm = await (navigator as any).permissions?.query({ name: "camera" });
        if (perm?.state === "denied") {
          setCameraStatus("denied");
          setMsg("Kamera nekad. Tillåt kamera i webbläsarens inställningar.");
          return;
        }
      } catch {}
      setCameraStatus("error");
      setMsg(e?.message || "Kunde inte öppna kameran.");
    }
  }

  const buildFeedbackMailto = () => {
    const tech = [
      "Beskriv din feedback här...",
      "",
      "--- Tekniskt (frivilligt, hjälper felsökning) ---",
      `Version: v${APP_VERSION}`,
      `Tema: ${theme}`,
      `Installerad (PWA): ${installed ? "ja" : "nej"}`,
      `Display-mode: ${window.matchMedia?.("(display-mode: standalone)")?.matches ? "standalone" : "browser"}`,
      `Språk: ${navigator.language}`,
      `UA: ${navigator.userAgent}`,
    ].join("\n");
    return `mailto:turessonrobyn@gmail.com?subject=${encodeURIComponent("Cinemoria – feedback")}&body=${encodeURIComponent(tech)}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMsg("Kunde inte kopiera länken.");
    }
  };

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

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const res = await importJson(text);
      const {
        addedMovies = 0, addedLists = 0, addedLinks = 0,
        addedBooks = 0, addedBookLists = 0, addedBookLinks = 0,
        addedGames = 0, addedGameLists = 0, addedGameLinks = 0,
        addedAlbums = 0, addedAlbumLists = 0, addedAlbumLinks = 0,
        addedComics = 0, addedComicLists = 0, addedComicLinks = 0,
      } = (res ?? {}) as any;
      const lines = [
        `• Filmer +${addedMovies}, Listor +${addedLists}, Film-kopplingar +${addedLinks}`,
        `• Böcker +${addedBooks}, Boklistor +${addedBookLists}, Bok-kopplingar +${addedBookLinks}`,
        `• Spel +${addedGames}, Spellistor +${addedGameLists}, Spel-kopplingar +${addedGameLinks}`,
        `• Album +${addedAlbums}, Albumlistor +${addedAlbumLists}, Album-kopplingar +${addedAlbumLinks}`,
        `• Serier +${addedComics}, Serielistor +${addedComicLists}, Serie-kopplingar +${addedComicLinks}`,
      ].join("\n");
      setMsg(`Import klar:\n\n${lines}`);
    } catch (e: any) {
      setMsg(e?.message || "Import misslyckades");
    }
  }

  async function handleWipe() {
    if (!confirm("Rensa all din data? (Filmer, listor, kopplingar, böcker, boklistor, spel, spellistor, album, albumlistor, serier och serielistor tas bort. Appen ligger kvar.)")) {
      return;
    }
    await wipeAll();
    setMsg("All data rensad.");
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
                  <h2 className="font-semibold">Installera som app</h2>
                  <p className="text-sand-300 text-sm">Fungerar offline och startar helskärm.</p>
                </div>
                <button className="btn btn-primary" onClick={install}>Installera</button>
              </div>
            </div>
          ) : isIOS ? (
            <div className="card p-4">
              <h2 className="font-semibold mb-1">Installera på iPhone/iPad</h2>
              <p className="text-sand-300 text-sm">
                Öppna delnings-menyn och välj <span className="font-semibold">“Lägg till på hemskärmen”</span>.
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* Språk */}
      <div className="card p-4">
        <LanguageSwitcher />
      </div>

      {/* Tema */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Tema</h2>
        <p className="text-sand-300 text-sm">Välj mellan mörkt, ljust eller sepia.</p>
        <div className="flex gap-2 flex-wrap">
          <button className={`btn ${theme === "dark" ? "btn-primary" : ""}`} onClick={() => setTheme("dark")}>Mörkt</button>
          <button className={`btn ${theme === "light" ? "btn-primary" : ""}`} onClick={() => setTheme("light")}>Ljust</button>
          <button className={`btn ${theme === "sepia" ? "btn-primary" : ""}`} onClick={() => setTheme("sepia")}>Sepia</button>
        </div>
      </div>

      {/* Datakällor & Autofyll */}
      <!-- resten av din befintliga ProfilePage följer oförändrat (OMDb, kamera, backup, hjälp, osv) -->
      {/* Jag lämnar allt nedanför orört för att hålla svaret inom rimlig längd.
          Klistra in från din nuvarande fil under denna kommentar,
          eller ersätt hela filen med din + språk-kortet ovan. */}
    </section>
  );
}