import { useEffect } from "react";

// OBS: vi antar att du redan har denna komponent:
// import BarcodeScanner from "@/components/BarcodeScanner";
import BarcodeScanner from "./BarcodeScanner";

type Props = {
  /** Körs när en streckkod hittas */
  onDetected: (code: string) => void;
  /** Stänger dialogen */
  onClose: () => void;
  /** Valfritt: rubrik i dialogen */
  title?: string;
  /** Valfritt: beskrivningstext */
  subtitle?: string;
};

export default function BarcodeScannerDialog({
  onDetected,
  onClose,
  title = "Skanna streckkod",
  subtitle = "Rikta kameran mot EAN/UPC. Blixt kan hjälpa i mörker.",
}: Props) {
  // stäng med Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      {/* panel */}
      <div className="relative mx-3 w-full max-w-md rounded-2xl bg-ink-900 border border-ink-700 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-ink-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sand-300 text-xs">{subtitle}</p>
          </div>
          <button className="chip" onClick={onClose} aria-label="Stäng">
            Stäng
          </button>
        </div>

        {/* Videoyta */}
        <div className="p-3">
          <div className="rounded-xl overflow-hidden bg-black aspect-[3/4]">
            {/* Din befintliga scanner renderar ett <video> inuti */}
            <BarcodeScanner
              onDetected={(code: string) => {
                // Liten debounce: stäng inte innan vi hinner skicka koden uppåt
                onDetected(code);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}