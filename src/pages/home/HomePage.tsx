// src/pages/home/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, Movie, getLists, getListCounts } from "@/db";
import MovieCard from "@/components/MovieCard";

type ListPreview = { id: number; name: string; count: number; createdAt: number };

export default function HomePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Movie[]>([]);
  const [movieStats, setMovieStats] = useState({
    total: 0,
    owned: 0,
    digital: 0,
    wish: 0,
    lists: 0,
  });
  const [listsPreview, setListsPreview] = useState<ListPreview[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [
          total,
          owned,
          digital,
          wish,
          listsCount,
          recentMovies,
          lists,
          listCounts,
        ] = await Promise.all([
          db.movies.count(),
          db.movies.filter((m) => !!m.owned).count(),
          db.movies.filter((m) => !!m.digital).count(),
          db.movies.filter((m) => !!m.wishlisted).count(),
          db.lists.count(),
          db.movies.orderBy("createdAt").reverse().limit(12).toArray(),
          getLists(),
          getListCounts(),
        ]);

        if (!alive) return;

        setMovieStats({ total, owned, digital, wish, lists: listsCount });
        setRecent(recentMovies);

        // Senaste 3 listorna (med antal)
        const withCounts: ListPreview[] = lists
          .map((l) => ({
            id: l.id as number,
            name: l.name,
            createdAt: l.createdAt,
            count: (listCounts as any)[String(l.id)] ?? 0,
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3);

        setListsPreview(withCounts);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const showEmptyWelcome =
    !loading && movieStats.total === 0 && movieStats.lists === 0;

  return (
    <section className="p-4 space-y-4">
      {/* Hero */}
      <header>
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          En hylla för allt du äger och älskar — film, böcker och spel. Offline och snabbt.
        </p>
      </header>

      {/* Välj sektion / Snabbstart */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">
              Hoppa in i rätt sektion. Lägg till nytt, sök eller bygg samlingar.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/movie" className="btn btn-primary">Film</Link>
            <Link to="/book" className="btn">Böcker</Link>
            <Link to="/game" className="btn">Spel</Link>
          </div>
        </div>
      </div>

      {/* Nyckeltal – film (bok/spel kommer efter DB-migration) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatCard label="Filmer" value={movieStats.total} />
        <StatCard label="Ägda (film)" value={movieStats.owned} />
        <StatCard label="Digitalt (film)" value={movieStats.digital} />
        <StatCard label="Önskelista (film)" value={movieStats.wish} />
        <StatCard label="Listor (film)" value={movieStats.lists} />
      </section>

      {/* Tomt läge – snabb CTA till film */}
      {showEmptyWelcome && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Din hylla väntar ✨</h3>
          <p className="text-sand-300 text-sm mb-3">
            Lägg till din första film eller importera en JSON-backup via Profil.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/movie/add")}>
              Lägg till film
            </button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      {/* Mina filmhyllor – snabb översikt */}
      {listsPreview.length > 0 && (
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Mina filmhyllor</h2>
            <Link to="/movie/collections" className="text-sm hover:underline">Visa alla</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {listsPreview.map((l) => (
              <Link
                key={l.id}
                to={`/movie/collections/${l.id}`}
                className="chip no-underline hover:opacity-90 flex items-center justify-between"
              >
                <span className="truncate">{l.name}</span>
                <span className="text-xs opacity-80">
                  {l.count} film{l.count === 1 ? "" : "er"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Senast tillagda (film) */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Senast tillagda (film)</h2>
          <Link to="/movie/search" className="text-sm hover:underline">Visa alla</Link>
        </div>
        <div className="space-y-3">
          {recent.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
          {!loading && recent.length === 0 && (
            <div className="text-sand-300 text-sm">Inga filmer ännu.</div>
          )}
        </div>
      </section>

      {/* Snabbgenvägar */}
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Genvägar</h3>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={() => navigate("/movie/search")}>Sök film</button>
          <button className="btn" onClick={() => navigate("/movie/add")}>Lägg till film</button>
          <button className="btn" onClick={() => navigate("/movie/collections")}>Filmhyllor</button>
          <Link className="btn" to="/profile">Profil & backup</Link>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sand-300 text-xs">{label}</div>
    </div>
  );
}