import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Hook som hanterar PWA-installation på ett säkert sätt.
 * - Visar isInstallable när Chrome/Edge/Android kan installera
 * - Fångar appinstalled och display-mode: standalone
 * - Fallback för iOS (instruktioner)
 */
type BIEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function usePWAInstall() {
  const deferredRef = useRef<BIEvent | null>(null);
  const [isInstallable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Upptäck om vi redan körs som app
  const isStandalone = () => {
    const mql = window.matchMedia?.("(display-mode: standalone)")?.matches;
    // iOS Safari
    // @ts-ignore
    const iosStandalone = (window.navigator as any).standalone;
    return Boolean(mql || iosStandalone);
  };

  useEffect(() => {
    setInstalled(isStandalone());

    const onBIP = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BIEvent;
      setInstallable(true);
    };

    const onInstalled = () => {
      deferredRef.current = null;
      setInstallable(false);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS-detektion (enkel)
    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window));

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
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
      // användaren backade
    }
  }, []);

  return {
    isInstallable,
    installed,
    isIOS,
    install,
  };
}