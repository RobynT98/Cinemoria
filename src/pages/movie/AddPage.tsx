// src/pages/AddPage.tsx
import MovieForm from '@/components/MovieForm'
import type { Movie } from '@/db'
import { addMovie } from '@/db'

export default function AddPage() {
  async function handleSubmit(data: Movie) {
    await addMovie(data)
    alert('Sparad!')
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till film</h1>

      <div className="card p-4">
        <MovieForm submitLabel="Spara film" onSubmit={handleSubmit} />
      </div>
    </section>
  )
}
