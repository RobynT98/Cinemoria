import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

type Props = {
  onResult: (code: string) => void;
  onError?: (err: unknown) => void;
  showClose?: boolean;
  onClose?: () => void;
};

export default function BarcodeScanner({
  onResult,
  onError,
  showClose = true,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);              // 👈 stoppa dubbla resultat
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const ctrl = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (res, err) => {
            if (handledRef.current) return;
            if (res?.getText()) {
              handledRef.current = true;
              stop();
              onResult(res.getText().trim());
              return;
            }
            // Ignorera “ingen kod i den här framen”-fel
            if (err && !(err as any)?.message?.includes("No MultiFormat Readers")) {
              // Riktiga fel får bubbla ut
              // console.debug(err);
            }
          }
        );
        controlsRef.current = ctrl;
      } catch (e) {
        onError?.(e);
        stop();
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    function stop() {
      try {
        controlsRef.current?.stop();
      } catch {}
      controlsRef.current = null;

      const stream = videoRef.current?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    }

    handledRef.current = false;
    start();

    return () => {
      cancelled = true;
      stop();
    };
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
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="w-3/4 h-24 border-2 border-white/70 rounded-lg"></div>
      </div>
    </div>
  );
}