import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Game } from "@/db";
import { X, Gamepad2, Check } from "lucide-react";

type Props = {
  open: boolean;
  game: Game | null;
  onClose: () => void;
};

export default function GameDetailsDialog({ open, game, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !game) return null;

  const onOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm grid place-items-center px-3"
      role="dialog"
      aria-modal="true"
      aria-label={`Detaljer för ${game.title}`}
    >
      <div className="card w-full max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/20">
          <h2 className="font-semibold text-lg truncate">{game.title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          {/* Cover */}
          <div>
            {game.coverUrl ? (
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-28 h-36 object-cover rounded-xl border border-ink-700/30"
                loading="lazy"
              />
            ) : (
              <div className="w-28 h-36 rounded-xl grid place-items-center bg-ink-700/40">
                <Gamepad2 className="opacity-70" />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {game.platform && <span className="chip">{game.platform}</span>}
              {game.year && <span className="chip">{game.year}</span>}
              {game.owned && <span className="chip"><Check className="w-3 h-3" /> Ägd</span>}
              {game.digital && <span className="chip">Digital</span>}
              {game.wishlisted && <span className="chip">Önskelista</span>}
              {game.format && <span className="chip">{game.format}</span>}
              {game.region && <span className="chip">{game.region}</span>}
              {game.barcode && <span className="chip">EAN: {short(game.barcode)}</span>}
            </div>

            <div className="mt-3 flex gap-2">
              {typeof game.id === "number" && (
                <Link to={`/game/edit/${game.id}`} className="btn btn-primary">Redigera</Link>
              )}
            </div>
          </div>

          {/* Notes */}
          {game.notes && (
            <div className="sm:col-span-2">
              <div className="font-semibold mb-1">Anteckningar</div>
              <div className="text-sm text-sand-300 whitespace-pre-wrap">{game.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function short(s: string) {
  return s.length > 13 ? s.slice(0, 6) + "…" + s.slice(-4) : s;
}