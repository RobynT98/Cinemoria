// src/pages/EditPage.tsx
import { useEffect, useState } from "react"
import { getMovie, updateMovie, type Movie } from "@/db"
import MovieForm from "@/components/MovieForm"
import { useParams, useNavigate } from "react-router-dom"

export default function EditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const numericId = Number(id)
    if (!id || Number.isNaN(numericId)) {
      setNotFound(true)
      return
    }

    getMovie(numericId).then((m) => {
      if (!m) setNotFound(true)
      else setMovie(m)
    })
  }, [id])

  if (notFound) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Hittar inte filmen</h1>
        <p className="text-sand-300">Filmen verkar inte finnas. Den kan ha tagits bort.</p>
      </section>
    )
  }

  if (!movie) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Redigerar…</h1>
        <div className="card p-6">Laddar film…</div>
      </section>
    )
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Redigera film</h1>
      <MovieForm
        submitLabel="Spara ändringar"
        initial={movie}
        onSubmit={async (data) => {
          // movie.id finns här (vi laddade den från DB)
          await updateMovie(movie.id!, data)
          alert("Uppdaterad!")
          navigate(-1)
        }}
      />
    </section>
  )
}
