import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Comic } from "@/db";
import { X, BookOpen, BadgeCheck, Download, Heart, Star } from "lucide-react";

type Props = { open: boolean; comic: Comic | null; onClose: () => void };

export default function ComicDetailsDialog({ open, comic, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !comic) return null;

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
      aria-label={`Detaljer för ${comic.title}`}
    >
      <div className="card w-full max-w-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/20">
          <h2 className="font-semibold text-lg truncate">{comic.title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          {/* Omslag */}
          <div>
            {comic.coverUrl ? (
              <img
                src={comic.coverUrl}
                alt={comic.title}
                className="w-28 h-36 object-cover rounded-xl border border-ink-700/30"
                loading="lazy"
              />
            ) : (
              <div className="w-28 h-36 rounded-xl grid place-items-center bg-ink-700/40">
                <BookOpen className="opacity-70" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sand-300 text-xs truncate">
                {(comic.series ? comic.series : "Fristående")}
                {comic.issue ? ` #${comic.issue}` : ""}
                {comic.year ? ` • ${comic.year}` : ""}
              </span>
              {typeof comic.rating === "number" && (
                <span className="chip">
                  <Star className="w-3 h-3" /> {comic.rating}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {comic.owned && <span className="chip"><BadgeCheck className="w-3.5 h-3.5" /> Ägd</span>}
              {comic.digital && <span className="chip"><Download className="w-3.5 h-3.5" /> Digital</span>}
              {comic.wishlisted && <span className="chip"><Heart className="w-3.5 h-3.5" /> Önskelista</span>}
              {comic.format && <span className="chip">{labelComicFormat(comic.format)}</span>}
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {typeof comic.id === "number" && (
                <Link to={`/comic/edit/${comic.id}`} className="btn btn-primary">Redigera</Link>
              )}
            </div>
          </div>

          {comic.notes && (
            <div className="sm:col-span-2">
              <div className="font-semibold mb-1">Anteckningar</div>
              <div className="text-sm text-sand-300 whitespace-pre-wrap">{comic.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelComicFormat(f?: Comic["format"]) {
  switch (f) {
    case "single": return "Singel";
    case "trade": return "TPB";
    case "hardcover": return "Inbunden";
    case "digital": return "Digital";
    default: return "Övrigt";
  }
}