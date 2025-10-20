// src/components/MovieDetailsDialog.tsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Movie } from "@/db";
import { X, Film, Star, Check } from "lucide-react";
import clsx from "classnames";

type Props = {
  open: boolean;
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieDetailsDialog({ open, movie, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Stäng på ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !movie) return null;

  // klick utanför
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
      aria-label={`Detaljer för ${movie.title}`}
    >
      <div className="card w-full max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/20">
          <h2 className="font-semibold text-lg truncate">{movie.title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          {/* Poster */}
          <div>
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-28 h-36 object-cover rounded-xl border border-ink-700/30"
                loading="lazy"
              />
            ) : (
              <div className="w-28 h-36 rounded-xl grid place-items-center bg-ink-700/40">
                <Film className="opacity-70" />
              </div>
            )}
          </div>

          {/* Text/metadata */}
          <div className="min-w-0">
            {/* Topline */}
            <div className="flex items-center gap-2 flex-wrap">
              {movie.year && <span className="chip">{movie.year}</span>}
              {movie.seen && (
                <span className="chip">
                  <Check className="w-3 h-3" /> Sett
                </span>
              )}
              {typeof movie.rating === "number" && (
                <span className="chip">
                  <Star className="w-3 h-3" /> {movie.rating}
                </span>
              )}
              {movie.genres?.length ? (
                <span className="text-sand-300 text-xs truncate">
                  {movie.genres.join(" • ")}
                </span>
              ) : null}
            </div>

            {/* Chips – samlarinfo */}
            <div className="mt-2 flex flex-wrap gap-2">
              {movie.owned && <span className="chip">Ägd</span>}
              {movie.digital && <span className="chip">Digital</span>}
              {movie.wishlisted && <span className="chip">Önskelista</span>}
              {movie.format && <span className="chip">{labelFormat(movie.format)}</span>}
              {movie.region && movie.region !== "NONE" && <span className="chip">{movie.region}</span>}
              {movie.videoStandard && <span className="chip">{movie.videoStandard}</span>}
              {movie.edition && <span className="chip">{movie.edition}</span>}
              {movie.audioVariant && <span className="chip">{movie.audioVariant}</span>}
              {movie.releaseYear && <span className="chip">Utg.år: {movie.releaseYear}</span>}
              {movie.location && <span className="chip">Plats: {movie.location}</span>}
              {movie.provider && <span className="chip">Tjänst: {movie.provider}</span>}
              {movie.barcode && <span className="chip">EAN: {short(movie.barcode)}</span>}
            </div>

            {/* Länkar */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {typeof movie.id === "number" && (
                <Link to={`/movie/edit/${movie.id}`} className="btn btn-primary">
                  Redigera
                </Link>
              )}
              {movie.trailerUrl && (
                <a className="btn" href={movie.trailerUrl} target="_blank" rel="noreferrer">
                  Trailer
                </a>
              )}
            </div>
          </div>

          {/* Anteckningar & övrigt – full bredd */}
          {(movie.notes || movie.cut) && (
            <div className="sm:col-span-2">
              {movie.notes && (
                <>
                  <div className="font-semibold mb-1">Anteckningar</div>
                  <div className="text-sm text-sand-300 whitespace-pre-wrap">{movie.notes}</div>
                </>
              )}
              {movie.cut && (
                <div className="mt-3 text-sm">
                  <span className="font-semibold">Cut:</span> {movie.cut}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelFormat(f?: Movie["format"]) {
  switch (f) {
    case "uhd":
      return "4K UHD";
    case "bluray":
      return "Blu-ray";
    case "dvd":
      return "DVD";
    case "digital":
      return "Digital";
    case "vhs":
      return "VHS";
    default:
      return "Övrigt";
  }
}

function short(s: string) {
  return s.length > 13 ? s.slice(0, 6) + "…" + s.slice(-4) : s;
}