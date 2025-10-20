import { useEffect } from "react";
import BarcodeScanner from "./BarcodeScanner";

type Props = {
  /** Körs när en streckkod hittas (ex. "5051892191831") */
  onDetected: (code: string) => void;
  /** Stäng dialogen */
  onClose: () => void;
  /** Valfritt: rubrik och text */
  title?: string;
  subtitle?: string;
};

export default function BarcodeScannerDialog({
  onDetected,
  onClose,
  title = "Skanna streckkod",
  subtitle = "Rikta kameran mot EAN/UPC. Blixt kan hjälpa i mörker.",
}: Props) {
  // Stäng med Escape
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
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
            <BarcodeScanner
              showClose={false}
              onResult={(code) => {
                onDetected(code);
                onClose(); // stäng när vi fått kod
              }}
              onError={(err) => {
                console.error("Scanner error:", err);
                // valfritt: visa toast/alert här
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}