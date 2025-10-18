// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, Movie } from "@/db";
import MovieCard from "@/components/MovieCard";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [countLists, setCountLists] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ms, lists] = await Promise.all([
          db.movies.orderBy("createdAt").reverse().limit(20).toArray(),
          db.lists.count(),
        ]);
        if (mounted) {
          setMovies(ms);
          setCountLists(lists);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const empty = !loading && movies.length === 0 && countLists === 0;

  return (
    <section className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          Din samling, dina regler. Håll koll på <span className="font-semibold">ägda filmer</span> – offline.
        </p>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">Lägg till en titel, skapa en hylla eller importera backup.</p>
          </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={() => navigate("/add")}>Lägg till ägd film</button>
          <Link to="/collections" className="btn">Skapa hylla</Link>
          <Link to="/profile" className="btn">Importera</Link>
        </div>
        </div>
      </div>

      {empty && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold mb-1">Tomt just nu</h3>
          <p className="text-sand-300 text-sm mb-3">
            Lägg till din första film eller importera en JSON-backup via Profil.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/add")}>Lägg till film</button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-2">Senast tillagda</h2>
      <div className="space-y-3">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
        {(!loading && movies.length === 0) && (
          <div className="text-sand-300 text-sm">Inga filmer ännu.</div>
        )}
      </div>
    </section>
  );
}