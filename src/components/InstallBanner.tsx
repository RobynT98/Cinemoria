import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function InstallBanner() {
  const { isInstallable, installed, isIOS, install } = usePWAInstall();

  // Visa inget om vi redan är installerade
  if (installed) return null;

  // iOS: visa instruktioner (ingen beforeinstallprompt där)
  if (isIOS) {
    return (
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Installera som app</h3>
            <p className="text-sand-300 text-sm">
              På iPhone: tryck <span className="font-semibold">Dela</span> →{" "}
              <span className="font-semibold">Lägg till på hemskärmen</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chromium: visa knapp när tillgängligt
  if (!isInstallable) return null;

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Installera som app</h3>
          <p className="text-sand-300 text-sm">
            Fungerar offline och startar helskärm.
          </p>
        </div>
        <button className="btn btn-primary" onClick={install}>
          Installera
        </button>
      </div>
    </div>
  );
}