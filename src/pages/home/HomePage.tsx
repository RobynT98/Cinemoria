// src/pages/home/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Movie, type Book, type Game } from "@/db";
import MovieCard from "@/components/MovieCard";
import BookCard from "@/components/BookCard";
import GameCard from "@/components/game/GameCard";

type Stats = { total: number; owned: number; digital: number; wish: number; lists: number };

export default function HomePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [movieStats, setMovieStats] = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });
  const [bookStats, setBookStats]   = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });
  const [gameStats, setGameStats]   = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });

  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recentBooks,  setRecentBooks]  = useState<Book[]>([]);
  const [recentGames,  setRecentGames]  = useState<Game[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [
          // Film
          mvTotal, mvOwned, mvDigital, mvWish, mvLists, mvRecent,
          // Bok
          bkTotal, bkOwned, bkDigital, bkWish, bkLists, bkRecent,
          // Spel
          gmTotal, gmOwned, gmDigital, gmWish, gmLists, gmRecent,
        ] = await Promise.all([
          // ----- FILM -----
          db.movies.count(),
          db.movies.filter((m) => !!m.owned).count(),
          db.movies.filter((m) => !!m.digital).count(),
          db.movies.filter((m) => !!m.wishlisted).count(),
          db.lists.count(),
          db.movies.orderBy("createdAt").reverse().limit(4).toArray(),

          // ----- BÖCKER -----
          db.books.count(),
          db.books.filter((b) => !!b.owned).count(),
          db.books.filter((b) => !!b.digital).count(),
          db.books.filter((b) => !!b.wishlisted).count(),
          db.bookLists.count(),
          db.books.orderBy("createdAt").reverse().limit(4).toArray(),

          // ----- SPEL -----
          db.games.count(),
          db.games.filter((g) => !!g.owned).count(),
          db.games.filter((g) => !!g.digital).count(),
          db.games.filter((g) => !!g.wishlisted).count(),
          db.gameLists.count(),
          db.games.orderBy("createdAt").reverse().limit(4).toArray(),
        ]);

        if (!alive) return;

        setMovieStats({ total: mvTotal, owned: mvOwned, digital: mvDigital, wish: mvWish, lists: mvLists });
        setBookStats ({ total: bkTotal, owned: bkOwned, digital: bkDigital, wish: bkWish, lists: bkLists });
        setGameStats ({ total: gmTotal, owned: gmOwned, digital: gmDigital, wish: gmWish, lists: gmLists });

        setRecentMovies(mvRecent);
        setRecentBooks(bkRecent);
        setRecentGames(gmRecent);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const totallyEmpty =
    !loading && movieStats.total === 0 && bookStats.total === 0 && gameStats.total === 0;

  return (
    <section className="p-4 space-y-6">
      {/* Hero */}
      <header>
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          En hylla för allt du äger och älskar — film, böcker och spel. Offline och snabbt.
        </p>
      </header>

      {/* Snabbstart */}
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

      {/* FILM */}
      <Section
        title="Filmer"
        stats={movieStats}
        onAdd={() => navigate("/movie/add")}
        onSearch={() => navigate("/movie/search")}
        onLists={() => navigate("/movie/collections")}
        recent={
          <div className="space-y-3">
            {recentMovies.map((m) => <MovieCard key={m.id} movie={m} />)}
            {!loading && recentMovies.length === 0 && <EmptyLine label="Inga filmer ännu." />}
          </div>
        }
      />

      {/* BÖCKER */}
      <Section
        title="Böcker"
        stats={bookStats}
        onAdd={() => navigate("/book/add")}
        onSearch={() => navigate("/book/search")}
        onLists={() => navigate("/book/collections")}
        recent={
          <div className="space-y-3">
            {recentBooks.map((b) => <BookCard key={b.id} book={b} />)}
            {!loading && recentBooks.length === 0 && <EmptyLine label="Inga böcker ännu." />}
          </div>
        }
      />

      {/* SPEL */}
      <Section
        title="Spel"
        stats={gameStats}
        onAdd={() => navigate("/game/add")}
        onSearch={() => navigate("/game/search")}
        onLists={() => navigate("/game/collections")}
        recent={
          <div className="space-y-3">
            {recentGames.map((g) => (
              <GameCard
                key={g.id}
                id={g.id}
                title={g.title}
                platform={g.platform}
                year={g.year}
                coverUrl={g.coverUrl}
                owned={g.owned}
                digital={g.digital}
                wishlisted={g.wishlisted}
                to={`/game/edit/${g.id}`}
              />
            ))}
            {!loading && recentGames.length === 0 && <EmptyLine label="Inga spel ännu." />}
          </div>
        }
      />

      {/* Tomt heltläge */}
      {totallyEmpty && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Din hylla väntar ✨</h3>
          <p className="text-sand-300 text-sm mb-3">
            Börja i den sektion som känns roligast. Du kan alltid importera en JSON-backup via Profil.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/movie/add")}>Lägg till film</button>
            <button className="btn" onClick={() => navigate("/book/add")}>Lägg till bok</button>
            <button className="btn" onClick={() => navigate("/game/add")}>Lägg till spel</button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}
    </section>
  );
}

/* ====== Små helpers ====== */

function Section({
  title,
  stats,
  onAdd,
  onSearch,
  onLists,
  recent,
}: {
  title: string;
  stats: { total: number; owned: number; digital: number; wish: number; lists: number };
  onAdd(): void;
  onSearch(): void;
  onLists(): void;
  recent: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <button className="btn" onClick={onSearch}>Sök</button>
          <button className="btn" onClick={onAdd}>Lägg till</button>
          <button className="btn" onClick={onLists}>Listor</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Totalt" value={stats.total} />
        <StatCard label="Ägda" value={stats.owned} />
        <StatCard label="Digitalt" value={stats.digital} />
        <StatCard label="Önskelista" value={stats.wish} />
        <StatCard label="Listor" value={stats.lists} />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Senast tillagda</h3>
        {recent}
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

function EmptyLine({ label }: { label: string }) {
  return <div className="text-sand-300 text-sm">{label}</div>;
}