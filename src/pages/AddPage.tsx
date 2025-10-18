import MovieForm from '@/components/MovieForm'
import { addMovie } from '@/db'

export default function AddPage() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till film</h1>
      <MovieForm onSubmit={async (data) => { await addMovie(data); alert('Sparad!'); }} />
    </section>
  )
}