// src/pages/profile/ProfilePage.tsx
import { exportJson, importJson, wipeAll } from "@/lib/backup";
import { useEffect, useRef, useState, useCallback } from "react";
import { useThemeStore } from "@/store/themeStore";
import { Link } from "react-router-dom";

// Inofficiell typ för beforeinstallprompt-eventet
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { theme, setTheme } = useThemeStore();

  // ---- PWA Install state ----
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // ---- OMDb & Streckkod (localStorage-backed) ----
  const [omdbEnabled, setOmdbEnabled] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cm_omdb_enabled") === "1" : false
  );
  const [omdbKey, setOmdbKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cm_omdb_key") ?? "" : ""
  );
  const [omdbCheck, setOmdbCheck] = useState<null | "ok" | "fail" | "busy">(null);

  const [cameraStatus, setCameraStatus] = useState<null | "ok" | "denied" | "error" | "busy">(null);

  useEffect(() => {
    localStorage.setItem("cm_omdb_enabled", omdbEnabled ? "1" : "0");
  }, [omdbEnabled]);

  useEffect(() => {
    // Spara tom sträng om nyckeln rensas
    localStorage.setItem("cm_omdb_key", omdbKey || "");
  }, [omdbKey]);

  // Är vi redan i standalone?
  const checkStandalone = useCallback(() => {
    const standaloneMedia = window.matchMedia?.("(display-mode: standalone)")?.matches;
    // iOS Safari (old school)
    const iosStandalone = (navigator as any).standalone;
    return Boolean(standaloneMedia || iosStandalone);
  }, []);

  useEffect(() => {
    setInstalled(checkStandalone());

    const onBIP = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setInstallable(true);
    };
    const onInstalled = () => {
      deferredRef.current = null;
      setInstallable(false);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // Uppdatera installed om display-mode ändras (Chrome m.fl.)
    const mm = window.matchMedia?.("(display-mode: standalone)");
    const onMM = () => setInstalled(checkStandalone());
    mm?.addEventListener?.("change", onMM);

    // iOS-koll
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window));

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      mm?.removeEventListener?.("change", onMM);
    };
  }, [checkStandalone]);

  const handleInstall = useCallback(async () => {
    const ev = deferredRef.current;
    if (!ev) return;
    await ev.prompt();
    try {
      const choice = await ev.userChoice;
      if (choice.outcome === "accepted") {
        deferredRef.current = null;
        setInstallable(false);
      }
    } catch {
      // användaren avbröt – inget att göra
    }
  }, []);

  // ---- OMDb: snabb test ----
  async function testOmdb() {
    if (!omdbKey.trim()) {
      setOmdbCheck("fail");
      setMsg("Ange en OMDb-nyckel först.");
      return;
    }
    try {
      setOmdbCheck("busy");
      // Minimal testfråga: "t=Inception&y=2010"
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(
        omdbKey.trim()
      )}&t=Inception&y=2010`;
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

  // ---- Kamera: snabb test ----
  async function testCamera() {
    try {
      setCameraStatus("busy");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      // Stäng direkt – vi vill bara trigga permission
      stream.getTracks().forEach((t) => t.stop());
      setCameraStatus("ok");
      localStorage.setItem("cm_barcode_tested", "1");
      setMsg("Kamera OK – streckkodsskannern kan användas.");
    } catch (e: any) {
      // Försök läsa permissions API (kan saknas)
      try {
        const perm = await (navigator as any).permissions?.query({ name: "camera" });
        if (perm?.state === "denied") {
          setCameraStatus("denied");
          setMsg("Kamera nekad. Tillåt kamera i webbläsarens inställningar.");
          return;
        }
      } catch {
        // ignore
      }
      setCameraStatus("error");
      setMsg(e?.message || "Kunde inte öppna kameran.");
    }
  }

  // ---- Backup / Import / Wipe ----
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

      // Stöd för alla counters (filmer, böcker, spel)
      const {
        addedMovies = 0,
        addedLists = 0,
        addedLinks = 0,
        addedBooks = 0,
        addedBookLists = 0,
        addedBookLinks = 0,
        addedGames = 0,
        addedGameLists = 0,
        addedGameLinks = 0,
      } = (res ?? {}) as any;

      const lines = [
        `• Filmer +${addedMovies}, Listor +${addedLists}, Film-kopplingar +${addedLinks}`,
        `• Böcker +${addedBooks}, Boklistor +${addedBookLists}, Bok-kopplingar +${addedBookLinks}`,
        `• Spel +${addedGames}, Spellistor +${addedGameLists}, Spel-kopplingar +${addedGameLinks}`,
      ].join("\n");

      setMsg(`Import klar:\n\n${lines}`);
    } catch (e: any) {
      setMsg(e?.message || "Import misslyckades");
    }
  }

  async function handleWipe() {
    if (
      !confirm(
        "Rensa all din data? (Filmer, listor, kopplingar, böcker, boklistor, spel och spellistor tas bort. Appen ligger kvar.)"
      )
    )
      return;
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
                <button className="btn btn-primary" onClick={handleInstall}>
                  Installera
                </button>
              </div>
            </div>
          ) : isIOS ? (
            <div className="card p-4">
              <h2 className="font-semibold mb-1">Installera på iPhone/iPad</h2>
              <p className="text-sand-300 text-sm">
                Öppna delnings-menyn och välj{" "}
                <span className="font-semibold">“Lägg till på hemskärmen”</span>.
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* Tema */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Tema</h2>
        <p className="text-sand-300 text-sm">Välj mellan mörkt, ljust eller sepia.</p>
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn ${theme === "dark" ? "btn-primary" : ""}`}
            onClick={() => setTheme("dark")}
          >
            Mörkt
          </button>
          <button
            className={`btn ${theme === "light" ? "btn-primary" : ""}`}
            onClick={() => setTheme("light")}
          >
            Ljust
          </button>
          <button
            className={`btn ${theme === "sepia" ? "btn-primary" : ""}`}
            onClick={() => setTheme("sepia")}
          >
            Sepia
          </button>
        </div>
      </div>

      {/* Datakällor & Autofyll */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Datakällor & Autofyll</h2>

        {/* OMDb */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={omdbEnabled}
                onChange={(e) => setOmdbEnabled(e.target.checked)}
              />
              Använd OMDb för film-autofyll
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
                ? "OK"
                : omdbCheck === "fail"
                ? "Fel"
                : omdbCheck === "busy"
                ? "Testar…"
                : "—"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <input
              type="password"
              value={omdbKey}
              onChange={(e) => setOmdbKey(e.target.value)}
              placeholder="OMDb API-nyckel"
              aria-label="OMDb API-nyckel"
            />
            <button className="btn" onClick={testOmdb} disabled={!omdbEnabled || !omdbKey.trim()}>
              Testa OMDb
            </button>
          </div>

          <p className="text-sand-300 text-xs">
            Nyckeln sparas lokalt i din webbläsare. Formulären kan läsa den och fylla i fält åt dig.
          </p>
        </div>

        <hr className="border-ink-700/30" />

        {/* Streckkod */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium">Streckkodsskanning</div>
              <div className="text-sand-300 text-xs">
                Testa kameratillstånd så skannern kan starta direkt i formulären.
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
                ? "Kamera OK"
                : cameraStatus === "denied"
                ? "Nekad"
                : cameraStatus === "error"
                ? "Fel"
                : cameraStatus === "busy"
                ? "Testar…"
                : "—"}
            </span>
          </div>
          <button className="btn" onClick={testCamera}>Testa kamera</button>
        </div>
      </div>

      {/* Backup */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={handleExport}>
            Exportera JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importera JSON
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

      {/* Hjälp */}
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Behöver du hjälp?</h2>
        <p className="text-sand-300 text-sm mb-2">
          Läs en kort guide med tips om hur du använder appen.
        </p>
        <Link to="/instructions" className="btn">Instruktioner</Link>
      </div>

      {/* Datahantering */}
      <div className="card p-4">
        <h2 className="font-semibold">Datahantering</h2>
        <p className="text-sand-300 text-sm mb-2">
          Behöver du börja om från noll? Du kan rensa all lokal data.
        </p>
        <button className="btn" onClick={handleWipe}>Rensa allt</button>
      </div>

      {/* Om-appen */}
      <div className="text-sand-300 text-sm">
        <ul className="list-disc pl-6 space-y-1">
          <li>App: Cinemoria v0.6.0</li>
          <li>Lagring: Offline (IndexedDB). Ingen server krävs.</li>
          <li>Plattform: GitHub Pages.</li>
        </ul>
      </div>
    </section>
  );
}