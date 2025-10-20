import { Book } from "@/db";
import { Link } from "react-router-dom";
import { BadgeCheck, Download, Heart, BookOpen } from "lucide-react";
import clsx from "classnames";

type BookCardProps = {
  book: Book;
  /** Gör hela kortet klickbart om satt (t.ex. till detalj- eller edit-sida) */
  to?: string;
  className?: string;
};

export default function BookCard({ book, to, className }: BookCardProps) {
  const owned = !!book.owned;
  const digital = !!book.digital;
  const wish = !!book.wishlisted;

  const body = (
    <article className={clsx("card p-3 flex gap-3 items-start", className)}>
      {/* Omslag */}
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-24 h-32 object-cover rounded-xl border border-ink-700/30"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-32 rounded-xl grid place-items-center bg-ink-700/40">
          <BookOpen className="opacity-70" />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold truncate">{book.title}</h3>
          {(book.author || book.year) && (
            <span className="text-sand-300 text-xs truncate">
              {book.author || "Okänd författare"}{book.year ? ` • ${book.year}` : ""}
            </span>
          )}
        </div>

        {/* Genres / extra */}
        {book.genres?.length ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {book.genres.slice(0, 4).map((g) => (
              <span className="chip" key={g}>{g}</span>
            ))}
          </div>
        ) : null}

        {/* Samlar-chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {owned && (
            <span className="chip"><BadgeCheck className="w-3.5 h-3.5" /> Ägd</span>
          )}
          {digital && (
            <span className="chip"><Download className="w-3.5 h-3.5" /> Digital</span>
          )}
          {wish && (
            <span className="chip"><Heart className="w-3.5 h-3.5" /> Önskelista</span>
          )}
          {book.format && <span className="chip">{labelBookFormat(book.format)}</span>}
          {book.language && <span className="chip">{book.language.toUpperCase()}</span>}
          {book.isbn && <span className="chip">ISBN: {short(book.isbn)}</span>}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {typeof book.id === "number" && (
            <Link to={`/book/edit/${book.id}`} className="btn">Redigera</Link>
          )}
          {/* Lägg ev. “Läs mer”-länk här om du vill senare */}
        </div>
      </div>
    </article>
  );

  return to ? (
    <Link to={to} className="block no-underline hover:opacity-95" aria-label={book.title}>
      {body}
    </Link>
  ) : body;
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