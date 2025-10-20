// src/components/BookDetailsDialog.tsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Book } from "@/db";
import { X, BookOpen, BadgeCheck, Download, Heart, Star } from "lucide-react";

type Props = {
  open: boolean;
  book: Book | null;
  onClose: () => void;
};

export default function BookDetailsDialog({ open, book, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // ESC för att stänga
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !book) return null;

  // Klick utanför dialogen
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
      aria-label={`Detaljer för ${book.title}`}
    >
      <div className="card w-full max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/20">
          <h2 className="font-semibold text-lg truncate">{book.title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          {/* Omslag */}
          <div>
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
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
            {/* Topline */}
            <div className="flex items-center gap-2 flex-wrap">
              {(book.author || book.year) && (
                <span className="text-sand-300 text-xs truncate">
                  {book.author || "Okänd författare"}{book.year ? ` • ${book.year}` : ""}
                </span>
              )}
              {typeof book.rating === "number" && (
                <span className="chip">
                  <Star className="w-3 h-3" /> {book.rating}
                </span>
              )}
              {book.genres?.length ? (
                <span className="text-sand-300 text-xs truncate">
                  {book.genres.join(" • ")}
                </span>
              ) : null}
            </div>

            {/* Chips – samlarinfo */}
            <div className="mt-2 flex flex-wrap gap-2">
              {book.owned && (
                <span className="chip">
                  <BadgeCheck className="w-3.5 h-3.5" /> Ägd
                </span>
              )}
              {book.digital && (
                <span className="chip">
                  <Download className="w-3.5 h-3.5" /> Digital
                </span>
              )}
              {book.wishlisted && (
                <span className="chip">
                  <Heart className="w-3.5 h-3.5" /> Önskelista
                </span>
              )}
              {book.format && <span className="chip">{labelBookFormat(book.format)}</span>}
              {book.language && <span className="chip">{book.language.toUpperCase()}</span>}
              {book.isbn && <span className="chip">ISBN: {short(book.isbn)}</span>}
              {book.publisher && <span className="chip">{book.publisher}</span>}
              {book.pages && <span className="chip">{book.pages} sidor</span>}
              {book.location && <span className="chip">Plats: {book.location}</span>}
            </div>

            {/* Länkar */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {typeof book.id === "number" && (
                <Link to={`/book/edit/${book.id}`} className="btn btn-primary">
                  Redigera
                </Link>
              )}
            </div>
          </div>

          {/* Anteckningar – full bredd */}
          {book.notes && (
            <div className="sm:col-span-2">
              <div className="font-semibold mb-1">Anteckningar</div>
              <div className="text-sm text-sand-300 whitespace-pre-wrap">{book.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelBookFormat(f?: Book["format"]) {
  switch (f) {
    case "paperback": return "Pocket";
    case "hardcover": return "Inbunden";
    case "ebook": return "E-bok";
    case "audiobook": return "Ljudbok";
    case "other":
    default: return "Övrigt";
  }
}

function short(s: string) {
  return s.length > 13 ? s.slice(0, 6) + "…" + s.slice(-4) : s;
}