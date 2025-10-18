import { Star, Check, Play, Clock, X, ExternalLink, Pencil } from 'lucide-react'
import type { Movie } from '../types'
import { Link } from 'react-router-dom'

export default function MovieCard({
  movie,
  onDelete
}: {
  movie: Movie
  onDelete?: (id: string) => void
}) {
  return (
    <article className="card p-3 flex gap-3">
      <img
        src={movie.posterUrl || 'https://placehold.co/80x120?text=No+Poster'}
        alt={movie.title}
        className="w-20 h-28 object-cover rounded-xl border border-ink-700"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1">
        <div className="flex items-start gap-2">
          <h3 className="font-semibold text-sand-100">
            {movie.title}
            {movie.year ? ` (${movie.year})` : ''}
          </h3>
          <StatusChip status={movie.status} />
          {typeof movie.rating === 'number' && (
            <span className="chip ml-auto">
              <Star size={14} /> {movie.rating}
            </span>
          )}
        </div>

        {(movie.genres?.length || movie.tags?.length) && (
          <p className="text-xs text-sand-300 mt-1 line-clamp-2">
            {[...(movie.genres || []), ...(movie.tags || [])].join(' • ')}
          </p>
        )}
        {movie.notes && <p className="text-xs text-sand-400 mt-2 line-clamp-2">{movie.notes}</p>}

        <div className="mt-3 flex gap-2 flex-wrap">
          <Link
            className="chip hover:opacity-90"
            to={`/edit/${movie.id}`}
            title="Redigera"
          >
            <Pencil size={14} /> Redigera
          </Link>
          {movie.trailerUrl && (
            <a
              className="chip hover:opacity-90"
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Öppna trailer"
            >
              <ExternalLink size={14} /> Trailer
            </a>
          )}
          {onDelete && (
            <button
              className="chip hover:opacity-90"
              onClick={() => onDelete(movie.id)}
              title="Ta bort"
            >
              <X size={14} /> Ta bort
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function StatusChip({ status }: { status: Movie['status'] }) {
  const icon =
    status === 'watched' ? <Check size={14} /> : status === 'watching' ? <Play size={14} /> : <Clock size={14} />
  const label = status === 'watched' ? 'Sett' : status === 'watching' ? 'Pågående' : 'Att se'
  return <span className="chip">{icon} {label}</span>
}