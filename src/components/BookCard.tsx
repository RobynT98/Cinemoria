// src/components/BookCard.tsx
import { Book } from "@/db";
import { BadgeCheck, Download, Heart } from "lucide-react";
import { clsx } from "clsx";

export default function BookCard({ book }: { book: Book }) {
  const owned = !!book.owned;
  const digital = !!book.digital;
  const wish = !!book.wishlisted;

  return (
    <article className="card p-3 flex gap-3">
      {/* Omslag */}
      <div className="w-16 h-24 rounded-xl overflow-hidden bg-sand-200 dark:bg-ink-800 shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-sand-400">
            Ingen bild
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="truncate font-semibold">{book.title}</h3>
        <p className="text-sand-300 text-xs truncate">
          {book.author || "Okänd författare"}
          {book.year ? ` • ${book.year}` : ""}
          {book.language ? ` • ${book.language.toUpperCase()}` : ""}
        </p>

        {/* Chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {owned && (
            <span className="chip">
              <BadgeCheck className="w-3.5 h-3.5" />
              Ägd
            </span>
          )}
          {digital && (
            <span className="chip">
              <Download className="w-3.5 h-3.5" />
              Digital
            </span>
          )}
          {wish && (
            <span className="chip">
              <Heart className="w-3.5 h-3.5" />
              Önskelista
            </span>
          )}
          {book.genres?.slice(0, 3).map((g) => (
            <span key={g} className="chip">{g}</span>
          ))}
        </div>
      </div>
    </article>
  );
}