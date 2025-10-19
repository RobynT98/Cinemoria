// src/pages/ProfilePage.tsx
import { exportJson, importJson, wipeAll } from "@/db";
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
      setMsg(
        `Import: filmer +${res.addedMovies}, listor +${res.addedLists}, kopplingar +${res.addedLinks}.`
      );
    } catch (e: any) {
      setMsg(e?.message || "Import misslyckades");
    }
  }

  async function handleWipe() {
    if (
      !confirm(
        "Rensa all din data? (Filmer, listor och kopplingar tas bort. Appen ligger kvar.)"
      )
    )
      return;
    await wipeAll();
    setMsg("All data rensad.");
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Profil & Inställningar</h1>

      {/* Installera som app */}
      {!installed && (
        <>
          {isInstallable ? (
            <div className="card p-4 mb-4">
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
            <div className="card p-4 mb-4">
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
      <div className="card p-4 mb-4 space-y-3">
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

      {/* Backup */}
      <div className="card p-4 mb-2 space-y-3">
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
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>
        {msg && <div className="text-sand-300 text-sm">{msg}</div>}
      </div>

      {/* Länk till instruktioner */}
      <div className="card p-4 mb-4">
        <h2 className="font-semibold mb-2">Behöver du hjälp?</h2>
        <p className="text-sand-300 text-sm mb-2">
          Läs en kort guide med tips om hur du använder appen.
        </p>
        <Link to="/instructions" className="btn">
          Instruktioner
        </Link>
      </div>

      {/* Datahantering */}
      <div className="card p-4 mb-4">
        <h2 className="font-semibold">Datahantering</h2>
        <p className="text-sand-300 text-sm mb-2">
          Behöver du börja om från noll? Du kan rensa all lokal data.
        </p>
        <button className="btn" onClick={handleWipe}>
          Rensa allt
        </button>
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