// src/components/MovieCard.tsx
import { type Movie } from "@/db";
import { Link } from "react-router-dom";
import { Film, Star, Check } from "lucide-react";
import clsx from "classnames";

type MovieCardProps = {
  movie: Movie;
  /** Länka kortet till en ruta (t.ex. /movie/edit/1). */
  to?: string;
  /** Om satt: gör kortet klickbart och kör denna när man klickar (öppna detaljdialog). */
  onOpenDetails?: () => void;
  className?: string;
};

export default function MovieCard({ movie, to, onOpenDetails, className }: MovieCardProps) {
  const body = (
    <article className={clsx("card p-3 flex gap-3 items-start", className)}>
      {/* Poster */}
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-24 h-32 object-cover rounded-xl border border-ink-700/30"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-32 rounded-xl grid place-items-center bg-ink-700/40">
          <Film className="opacity-70" />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold truncate">{movie.title}</h3>
          {movie.year && <span className="text-sand-300">({movie.year})</span>}
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
        </div>

        {movie.genres?.length ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <span className="chip" key={g}>{g}</span>
            ))}
          </div>
        ) : null}

        {/* Samlar-chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {movie.owned && <span className="chip">Ägd</span>}
          {movie.digital && <span className="chip">Digital</span>}
          {movie.wishlisted && <span className="chip">Önskelista</span>}
          {movie.format && <span className="chip">{labelFormat(movie.format)}</span>}
          {movie.region && movie.region !== "NONE" && <span className="chip">{movie.region}</span>}
          {movie.videoStandard && <span className="chip">{movie.videoStandard}</span>}
          {movie.edition && <span className="chip">{movie.edition}</span>}
          {movie.audioVariant && <span className="chip">{movie.audioVariant}</span>}
          {movie.barcode && <span className="chip">EAN: {short(movie.barcode)}</span>}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {typeof movie.id === "number" && (
            <Link to={`/movie/edit/${movie.id}`} className="btn">Redigera</Link>
          )}
          {movie.trailerUrl && (
            <a className="btn" href={movie.trailerUrl} target="_blank" rel="noreferrer">Trailer</a>
          )}
        </div>
      </div>
    </article>
  );

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