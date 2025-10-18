import { Star, Check, Play, Clock, X } from 'lucide-react'
import type { Movie } from '../types'

export default function MovieCard({ movie, onDelete }: { movie: Movie; onDelete?: (id: string) => void }) {
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
          <h3 className="font-semibold text-sand-100">{movie.title}{movie.year ? ` (${movie.year})` : ''}</h3>
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

        {onDelete && (
          <button
            className="mt-2 text-xs text-sand-400 hover:text-sand-200 inline-flex items-center gap-1"
            onClick={() => onDelete(movie.id)}
          >
            <X size={14} /> Ta bort
          </button>
        )}
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