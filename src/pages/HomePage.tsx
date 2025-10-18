import { useEffect, useState } from 'react'
import { getAllMovies, deleteMovie } from '@/db'
import type { Movie } from '@/types'
import MovieCard from '@/components/MovieCard'

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[] | null>(null)

  async function load() {
    const all = await getAllMovies()
    setMovies(all)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Cinemoria</h1>
      <p className="text-sand-300">Din filmvärld, offline och snabb. Här dyker senast tillagda upp.</p>

      <div className="mt-4 space-y-3">
        {movies === null && <div className="card p-6">Laddar…</div>}
        {movies?.length === 0 && (
          <div className="card p-6">Du har inga filmer ännu.</div>
        )}
        {movies?.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            onDelete={async (id) => {
              await deleteMovie(id)
              await load()
            }}
          />
        ))}
      </div>
    </section>
  )
}