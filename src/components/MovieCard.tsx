// src/components/MovieCard.tsx
import { Movie } from "@/db";
import { Link } from "react-router-dom";
import { Film, Star, Check } from "lucide-react";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="card p-3 flex gap-3 items-start">
      {movie.posterUrl ? (
        <img src={movie.posterUrl} alt={movie.title}
             className="w-24 h-32 object-cover rounded-xl border border-ink-700/30" />
      ) : (
        <div className="w-24 h-32 rounded-xl grid place-items-center bg-ink-700/40">
          <Film className="opacity-70" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{movie.title}</h3>
          {movie.year && <span className="text-sand-300">({movie.year})</span>}
          {movie.seen && (
            <span className="chip"><Check className="w-3 h-3" /> Sett</span>
          )}
          {typeof movie.rating === "number" && (
            <span className="chip"><Star className="w-3 h-3" /> {movie.rating}</span>
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
          {movie.format && <span className="chip">Format: {labelFormat(movie.format)}</span>}
          {movie.location && <span className="chip">Plats: {movie.location}</span>}
          {movie.provider && <span className="chip">Tjänst: {movie.provider}</span>}
        </div>

        <div className="mt-3 flex gap-2">
          <Link to={`/edit/${movie.id}`} className="btn">Redigera</Link>
          {movie.trailerUrl && (
            <a className="btn" href={movie.trailerUrl} target="_blank" rel="noreferrer">Trailer</a>
          )}
        </div>
      </div>
    </div>
  );
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