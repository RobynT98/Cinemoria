// src/components/MovieCard.tsx
import { type Movie } from "@/db";
import { Link } from "react-router-dom";
import { Film, Star, Check } from "lucide-react";
import clsx from "classnames";

type MovieCardProps = {
  movie: Movie;
  /** Länka kortet till en route (t.ex. /movie/edit/1). */
  to?: string;
  /** Om satt: gör kortet klickbart och kör denna när man klickar (öppna detaljdialog). */
  onOpenDetails?: () => void;
  /** Kompakt layout (mindre poster, tajtare chips, färre detaljer). */
  compact?: boolean;
  className?: string;
};

export default function MovieCard({
  movie,
  to,
  onOpenDetails,
  compact = false,
  className,
}: MovieCardProps) {
  // Håll samma ratio som Game/Book (3:4)
  const posterSize = compact ? "w-16 h-24" : "w-24 h-32";
  const containerPad = compact ? "p-2.5" : "p-3";
  const titleCls = clsx("font-semibold truncate", compact && "text-sm");
  const metaCls = clsx("text-sand-300", compact ? "text-xs" : "text-[13px]");
  const chipTight = compact ? "px-2 py-0.5 text-[10px] leading-none" : "";
  const chipRow = compact ? "mt-1 flex flex-wrap gap-1.5" : "mt-2 flex flex-wrap gap-2";

  const body = (
    <article className={clsx("card flex gap-3 items-start", containerPad, className)}>
      {/* Poster */}
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className={clsx(posterSize, "object-cover rounded-xl border border-ink-700/30")}
          loading="lazy"
        />
      ) : (
        <div className={clsx(posterSize, "rounded-xl grid place-items-center bg-ink-700/40")}>
          <Film className="opacity-70" />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={titleCls}>{movie.title}</h3>
          {movie.year && <span className={metaCls}>({movie.year})</span>}
          {movie.seen && (
            <span className={clsx("chip", chipTight)}>
              <Check className="w-3 h-3" /> Sett
            </span>
          )}
          {typeof movie.rating === "number" && (
            <span className={clsx("chip", chipTight)}>
              <Star className="w-3 h-3" /> {movie.rating}
            </span>
          )}
        </div>

        {/* Genrer – visa inte i compact (håller listan ren), annars alla */}
        {!compact && movie.genres?.length ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <span className="chip" key={g}>{g}</span>
            ))}
          </div>
        ) : null}

        {/* Samlar-chips */}
        <div className={chipRow}>
          {movie.owned && <span className={clsx("chip", chipTight)}>Ägd</span>}
          {movie.digital && <span className={clsx("chip", chipTight)}>Digital</span>}
          {movie.wishlisted && <span className={clsx("chip", chipTight)}>Önskelista</span>}
          {movie.format && <span className={clsx("chip", chipTight)}>{labelFormat(movie.format)}</span>}
          {/* Dölj “tunga” metadata i compact, visa i full */}
          {!compact && movie.region && movie.region !== "NONE" && <span className="chip">{movie.region}</span>}
          {!compact && movie.videoStandard && <span className="chip">{movie.videoStandard}</span>}
          {!compact && movie.edition && <span className="chip">{movie.edition}</span>}
          {!compact && movie.audioVariant && <span className="chip">{movie.audioVariant}</span>}
          {movie.barcode && <span className={clsx("chip", chipTight)}>EAN: {short(movie.barcode)}</span>}
        </div>

        {/* Actions – bara i icke-kompakt */}
        {!compact && (
          <div className="mt-3 flex gap-2">
            {typeof movie.id === "number" && (
              <Link to={`/movie/edit/${movie.id}`} className="btn">Redigera</Link>
            )}
            {movie.trailerUrl && (
              <a className="btn" href={movie.trailerUrl} target="_blank" rel="noreferrer">Trailer</a>
            )}
          </div>
        )}
      </div>
    </article>
  );

  // Prioritet: to > onOpenDetails > bara body
  if (to) {
    return (
      <Link to={to} className="block no-underline hover:opacity-95" aria-label={movie.title}>
        {body}
      </Link>
    );
  }

  if (onOpenDetails) {
    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpenDetails();
      }
    };
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenDetails}
        onKeyDown={onKeyDown}
        className="block hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-600 rounded-2xl"
        aria-label={`Öppna detaljer för ${movie.title}`}
      >
        {body}
      </div>
    );
  }

  return body;
}

function labelFormat(f?: Movie["format"]) {
  switch (f) {
    case "uhd": return "4K UHD";
    case "bluray": return "Blu-ray";
    case "dvd": return "DVD";
    case "digital": return "Digital";
    case "vhs": return "VHS";
    default: return "Övrigt";
  }
}
function short(s: string) {
  return s.length > 13 ? s.slice(0, 6) + "…" + s.slice(-4) : s;
}