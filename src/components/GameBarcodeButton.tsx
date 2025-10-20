import { useState } from "react";
import BarcodeScannerDialog from "./BarcodeScannerDialog";

type Props = {
  /** Körs när streckkoden hittats */
  onCode: (code: string) => void;
};

/**
 * Enkel knapp som öppnar kamera-dialogen,
 * läser streckkod och returnerar värdet via onCode().
 */
export default function GameBarcodeButton({ onCode }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        Skanna streckkod
      </button>

      {open && (
        <BarcodeScannerDialog
          onDetected={(code) => {
            onCode(code);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          title="Skanna spelstreckkod"
          subtitle="Kameran startar – rikta mot EAN/UPC"
        />
      )}
    </>
  );
}