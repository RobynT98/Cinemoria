import { useEffect, useMemo, useState } from 'react'
import { getAllMovies } from '@/db'
import type { Movie, MovieStatus } from '@/types'
import MovieCard from '@/components/MovieCard'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<MovieStatus | 'all'>('all')
  const [all, setAll] = useState<Movie[]>([])

  useEffect(() => {
    getAllMovies().then(setAll)
  }, [])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all.filter((m) => {
      if (status !== 'all' && m.status !== status) return false
      if (!needle) return true
      const hay = [
        m.title,
        m.year?.toString() || '',
        ...(m.genres || []),
        ...(m.tags || []),
        m.notes || ''
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [all, q, status])

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Titel, taggar, genrer…"
          className="w-full rounded-2xl bg-ink-800 border border-ink-700 px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500"
        />
        <select
          className="rounded-2xl bg-ink-800 border border-ink-700 px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">Alla</option>
          <option value="planned">Att se</option>
          <option value="watching">Pågående</option>
          <option value="watched">Sett</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {results.map((m) => <MovieCard key={m.id} movie={m} />)}
        {results.length === 0 && <div className="text-sand-300 text-sm">Inget matchade sökningen.</div>}
      </div>
    </section>
  )
}