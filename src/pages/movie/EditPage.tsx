// src/pages/movie/EditPage.tsx
import { useEffect, useState } from "react";
import {
  getMovie,
  updateMovie,
  type Movie,
  // Följande två gör radering robust:
  db,
  // Om du redan har en helper i db: deleteMovie(id: number)
  // importera den – men vi hanterar även när den saknas.
  // @ts-ignore
  deleteMovie as removeMovieMaybe,
} from "@/db";
import MovieForm from "@/components/MovieForm";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      setNotFound(true);
      return;
    }
    getMovie(numericId).then((m) => {
      if (!m) setNotFound(true);
      else setMovie(m);
    });
  }, [id]);

  async function handleDelete() {
    if (!movie?.id) return;
    const ok = confirm(
      `Ta bort "${movie.title}"? Detta går inte att ångra.\n\n` +
      `Eventuella listkopplingar tas bort samtidigt.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      // Om du har en db-helper, använd den – annars ta bort direkt från Dexie.
      if (typeof removeMovieMaybe === "function") {
        await (removeMovieMaybe as (id: number) => Promise<void>)(movie.id);
      } else {
        // Minimal fallback: ta bort filmen.
        // (Om du har en länktabell, kan du rensa den här också.)
        await db.movies.delete(movie.id);
        // Exempel för länktabell om den heter "movieLinks":
        // await db.movieLinks.where({ movieId: movie.id }).delete();
      }
      alert("Filmen togs bort.");
      navigate("/movie");
    } catch (e) {
      alert("Kunde inte radera. Försök igen.");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/movie" className="chip"><ArrowLeft size={16}/> Tillbaka</Link>
          <h1 className="text-2xl font-semibold">Hittar inte filmen</h1>
        </div>
        <p className="text-sand-300">
          Filmen verkar inte finnas. Den kan ha tagits bort.
        </p>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Redigerar…</h1>
        <div className="card p-6">Laddar film…</div>
      </section>
    );
  }

  return (
    <section className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Link to="/movie" className="chip"><ArrowLeft size={16}/> Tillbaka</Link>
        <h1 className="text-2xl font-semibold">Redigera film</h1>
      </div>

      <MovieForm
        submitLabel="Spara ändringar"
        initial={movie}
        onSubmit={async (data) => {
          await updateMovie(movie.id!, data);
          alert("Uppdaterad!");
          navigate(-1);
        }}
      />

      {/* Destruktiva åtgärder */}
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Farlig zon</h2>
        <p className="text-sand-300 text-sm mb-3">
          Raderar filmen permanent från ditt bibliotek.
        </p>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={busy}
          aria-label="Radera film permanent"
        >
          <Trash2 className="w-4 h-4" />
          Radera film
        </button>
      </div>
    </section>
  );
}