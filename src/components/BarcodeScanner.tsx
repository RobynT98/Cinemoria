// src/components/BarcodeScanner.tsx
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

type Props = {
  /** Får streckkoden som ren text (t.ex. "5051892191831") */
  onResult: (code: string) => void;
  /** Om något går fel (kamera nekas, etc.) */
  onError?: (err: unknown) => void;
  /** Visa liten “Stäng”-knapp uppe i hörnet (default: true) */
  showClose?: boolean;
  /** Körs när användaren stänger utan resultat */
  onClose?: () => void;
};

export default function BarcodeScanner({
  onResult,
  onError,
  showClose = true,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const reader = new BrowserMultiFormatReader();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Viktigt: vänta in promisens resultat innan vi sätter state
        const ctrl = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (res, err) => {
            if (res?.getText()) {
              stop();
              onResult(res.getText().trim());
            } else if (
              err &&
              !(err as any)?.message?.includes("No MultiFormat Readers")
            ) {
              // ignorerar “inget hittat i den här framen”
            }
          }
        );
        setControls(ctrl);
      } catch (e) {
        onError?.(e);
        stop();
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    function stop() {
      controls?.stop();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    }

    start();

    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResult, onError, showClose, onClose]);

  return (
    <div className="relative rounded-xl overflow-hidden">
      {showClose && (
        <button
          className="absolute right-2 top-2 z-10 chip"
          onClick={onClose}
          aria-label="Stäng skanner"
        >
          Stäng
        </button>
      )}
      <video
        ref={videoRef}
        className="w-full aspect-[3/4] bg-black object-cover"
        playsInline
        muted
      />
      <div className="absolute inset-x-0 bottom-0 p-2 text-center text-xs text-white/80 bg-gradient-to-t from-black/60 to-transparent">
        {starting ? "Startar kamera…" : "Rikta mot streckkoden"}
      </div>
      {/* enkel siktruta */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="w-3/4 h-24 border-2 border-white/70 rounded-lg"></div>
      </div>
    </div>
  );
}