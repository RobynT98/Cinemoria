import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Album } from "@/db";
import { X, Music, BadgeCheck, Download, Heart, Star } from "lucide-react";

type Props = { open: boolean; album: Album | null; onClose: () => void };

export default function AlbumDetailsDialog({ open, album, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !album) return null;

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
      aria-label={`Detaljer för ${album.title}`}
    >
      <div className="card w-full max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/20">
          <h2 className="font-semibold text-lg truncate">{album.title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          {/* Omslag */}
          <div>
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-28 h-28 object-cover rounded-xl border border-ink-700/30"
                loading="lazy"
              />
            ) : (
              <div className="w-28 h-28 rounded-xl grid place-items-center bg-ink-700/40">
                <Music className="opacity-70" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {(album.artist || album.year) && (
                <span className="text-sand-300 text-xs truncate">
                  {album.artist || "Okänd artist"}{album.year ? ` • ${album.year}` : ""}
                </span>
              )}
              {typeof album.rating === "number" && (
                <span className="chip">
                  <Star className="w-3 h-3" /> {album.rating}
                </span>
              )}
              {album.genres?.length ? (
                <span className="text-sand-300 text-xs truncate">
                  {album.genres.join(" • ")}
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {album.owned && <span className="chip"><BadgeCheck className="w-3.5 h-3.5" /> Ägd</span>}
              {album.digital && <span className="chip"><Download className="w-3.5 h-3.5" /> Digital</span>}
              {album.wishlisted && <span className="chip"><Heart className="w-3.5 h-3.5" /> Önskelista</span>}
              {album.format && <span className="chip">{labelAlbumFormat(album.format)}</span>}
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {typeof album.id === "number" && (
                <Link to={`/album/edit/${album.id}`} className="btn btn-primary">Redigera</Link>
              )}
            </div>
          </div>

          {album.notes && (
            <div className="sm:col-span-2">
              <div className="font-semibold mb-1">Anteckningar</div>
              <div className="text-sm text-sand-300 whitespace-pre-wrap">{album.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelAlbumFormat(f?: Album["format"]) {
  switch (f) {
    case "vinyl": return "Vinyl";
    case "cd": return "CD";
    case "cassette": return "Kassett";
    case "digital": return "Digital";
    default: return "Övrigt";
  }
}