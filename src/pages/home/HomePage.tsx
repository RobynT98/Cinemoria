import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Movie, type Book, type Game, type Album, type Comic } from "@/db";
import MovieCard from "@/components/MovieCard";
import BookCard from "@/components/BookCard";
import GameCard from "@/components/game/GameCard";
import AlbumCard from "@/components/AlbumCard";
import ComicCard from "@/components/ComicCard";
import { useTranslation } from "react-i18next"; 

type Stats = { total: number; owned: number; digital: number; wish: number; lists: number };

export default function HomePage() {
  const navigate = useNavigate();
  // Använd ready flaggan FÖR ATT UNDVIKA DUBBEL Suspense
  const { t, ready: i18nReady } = useTranslation(); 
  
  // 🏆 DEN SLUTGILTIGA FIXEN: Manuell state för att lösa timing-kraschen
  const [initialRenderFixed, setInitialRenderFixed] = useState(false);

  useEffect(() => {
    // VIKTIG FIX: Tvinga fram en omrendering efter 10ms. 
    // Detta löser den sista racen som gör att nycklarna syns.
    const timer = setTimeout(() => {
      setInitialRenderFixed(true);
    }, 10); 

    return () => clearTimeout(timer);
  }, []);
  // SLUT FIX

  const [loading, setLoading] = useState(true);
  // ... (resten av useState) ...

  const [movieStats, setMovieStats]   = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });
  const [bookStats, setBookStats]     = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });
  const [gameStats, setGameStats]     = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });
  const [albumStats, setAlbumStats]   = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });
  const [comicStats, setComicStats]   = useState<Stats>({ total: 0, owned: 0, digital: 0, wish: 0, lists: 0 });

  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recentBooks,  setRecentBooks]  = useState<Book[]>([]);
  const [recentGames,  setRecentGames]  = useState<Game[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [recentComics, setRecentComics] = useState<Comic[]>([]);

  useEffect(() => {
    let alive = true;

    // Datahämtning via Dexie/IndexedDB (behöver inte triggas av språkbyte)
    (async () => {
      try {
        const [
          mvTotal, mvOwned, mvDigital, mvWish, mvLists, mvRecent,
          bkTotal, bkOwned, bkDigital, bkWish, bkLists, bkRecent,
          gmTotal, gmOwned, gmDigital, gmWish, gmLists, gmRecent,
          alTotal, alOwned, alDigital, alWish, alLists, alRecent,
          ccTotal, ccOwned, ccDigital, ccWish, ccLists, ccRecent,
        ] = await Promise.all([
          // FILM
          db.movies.count(), db.movies.filter((m) => !!m.owned).count(), db.movies.filter((m) => !!m.digital).count(), db.movies.filter((m) => !!m.wishlisted).count(), db.lists.count(), db.movies.orderBy("createdAt").reverse().limit(4).toArray(),
          // BÖCKER
          db.books.count(), db.books.filter((b) => !!b.owned).count(), db.books.filter((b) => !!b.digital).count(), db.books.filter((b) => !!b.wishlisted).count(), db.bookLists.count(), db.books.orderBy("createdAt").reverse().limit(4).toArray(),
          // SPEL
          db.games.count(), db.games.filter((g) => !!g.owned).count(), db.games.filter((g) => !!g.digital).count(), db.games.filter((g) => !!g.wishlisted).count(), db.gameLists.count(), db.games.orderBy("createdAt").reverse().limit(4).toArray(),
          // ALBUM (musik)
          db.albums.count(), db.albums.filter((a) => !!a.owned).count(), db.albums.filter((a) => !!a.digital).count(), db.albums.filter((a) => !!a.wishlisted).count(), db.albumLists.count(), db.albums.orderBy("createdAt").reverse().limit(4).toArray(),
          // SERIER (comics)
          db.comics.count(), db.comics.filter((c) => !!c.owned).count(), db.comics.filter((c) => !!c.digital).count(), db.comics.filter((c) => !!c.wishlisted).count(), db.comicLists.count(), db.comics.orderBy("createdAt").reverse().limit(4).toArray(),
        ]);

        if (!alive) return;

        setMovieStats({ total: mvTotal, owned: mvOwned, digital: mvDigital, wish: mvWish, lists: mvLists });
        setBookStats ({ total: bkTotal, owned: bkOwned, digital: bkDigital, wish: bkWish, lists: bkLists });
        setGameStats ({ total: gmTotal, owned: gmOwned, digital: gmDigital, wish: gmWish, lists: gmLists });
        setAlbumStats({ total: alTotal, owned: alOwned, digital: alDigital, wish: alWish, lists: alLists });
        setComicStats({ total: ccTotal, owned: ccOwned, digital: ccDigital, wish: ccWish, lists: ccLists });

        setRecentMovies(mvRecent);
        setRecentBooks(bkRecent);
        setRecentGames(gmRecent);
        setRecentAlbums(alRecent);
        setRecentComics(ccRecent);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // PAUSA RENDERINGEN OM ÖVERSÄTTNINGAR INTE ÄR KLARA
  // Kontrollera både i18n.ready och den manuella fixen
  if (!i18nReady || !initialRenderFixed) {
    // Visa endast en minimal laddningsindikator
    return <section className="p-4 space-y-6"><EmptyLine label={t("loading", "Laddar...")} /></section>;
  }


  const totallyEmpty =
    !loading &&
    movieStats.total === 0 &&
    bookStats.total === 0 &&
    gameStats.total === 0 &&
    albumStats.total === 0 &&
    comicStats.total === 0;

  return (
    <section className="p-4 space-y-6">
      {/* Hero */}
      <header>
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          {t("home.hero_lead", "En hylla för allt du äger och älskar — film, böcker och spel. Offline och snabbt.")}
        </p>
      </header>

      {/* Snabbstart */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">{t("home.get_started", "Kom igång")}</h2>
            <p className="text-sand-300 text-sm">
              {t("home.get_started_hint", "Hoppa in i rätt sektion. Lägg till nytt, sök eller bygg samlingar.")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/movie" className="btn btn-primary">{t("home.btn.movie", "Film")}</Link>
            <Link to="/book" className="btn">{t("home.btn.book", "Böcker")}</Link>
            <Link to="/game" className="btn">{t("home.btn.game", "Spel")}</Link>
            <Link to="/album" className="btn">{t("home.btn.album", "Musik")}</Link>
            <Link to="/comic" className="btn">{t("home.btn.comic", "Serier")}</Link>
          </div>
        </div>
      </div>

      {/* FILM */}
      <Section
        t={t} // Skicka t-funktions referens till Section
        titleKey="home.stats.movies"
        emptyKey="home.stats.empty_movies"
        stats={movieStats}
        loading={loading}
        onAdd={() => navigate("/movie/add")}
        onSearch={() => navigate("/movie/search")}
        onLists={() => navigate("/movie/collections")}
        recent={
          <div className="space-y-3">
            {recentMovies.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        }
      />

      {/* BÖCKER */}
      <Section
        t={t}
        titleKey="home.stats.books"
        emptyKey="home.stats.empty_books"
        stats={bookStats}
        loading={loading}
        onAdd={() => navigate("/book/add")}
        onSearch={() => navigate("/book/search")}
        onLists={() => navigate("/book/collections")}
        recent={
          <div className="space-y-3">
            {recentBooks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        }
      />

      {/* SPEL */}
      <Section
        t={t}
        titleKey="home.stats.games"
        emptyKey="home.stats.empty_games"
        stats={gameStats}
        loading={loading}
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
          </div>
        }
      />

      {/* MUSIK (Album) */}
      <Section
        t={t}
        titleKey="home.stats.albums"
        emptyKey="home.stats.empty_albums"
        stats={albumStats}
        loading={loading}
        onAdd={() => navigate("/album/add")}
        onSearch={() => navigate("/album/search")}
        onLists={() => navigate("/album/collections")}
        recent={
          <div className="space-y-3">
            {recentAlbums.map((a) => <AlbumCard key={a.id} album={a} />)}
          </div>
        }
      />

      {/* SERIER (Comics) */}
      <Section
        t={t}
        titleKey="home.stats.comics"
        emptyKey="home.stats.empty_comics"
        stats={comicStats}
        loading={loading}
        onAdd={() => navigate("/comic/add")}
        onSearch={() => navigate("/comic/search")}
        onLists={() => navigate("/comic/collections")}
        recent={
          <div className="space-y-3">
            {recentComics.map((c) => <ComicCard key={c.id} comic={c} />)}
          </div>
        }
      />

      {/* Tomt heltläge */}
      {totallyEmpty && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">{t("home.empty_title", "Din hylla väntar ✨")}</h3>
          <p className="text-sand-300 text-sm mb-3">
            {t("home.empty_hint", "Börja i den sektion som känns roligast. Du kan alltid importera en JSON-backup via Profil.")}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/movie/add")}>{t("home.btn.add_movie", "Lägg till film")}</button>
            <button className="btn" onClick={() => navigate("/book/add")}>{t("home.btn.add_book", "Lägg till bok")}</button>
            <button className="btn" onClick={() => navigate("/game/add")}>{t("home.btn.add_game", "Lägg till spel")}</button>
            <button className="btn" onClick={() => navigate("/album/add")}>{t("home.btn.add_album", "Lägg till album")}</button>
            <button className="btn" onClick={() => navigate("/comic/add")}>{t("home.btn.add_comic", "Lägg till serie")}</button>
            <Link to="/profile" className="btn">{t("home.btn.import_backup", "Importera backup")}</Link>
          </div>
        </div>
      )}
      {/* Ladda klart visas inte när ready flaggan är på plats */}
      {!loading && !totallyEmpty && <EmptyLine label={t("loading", "Laddar...")} />} 
    </section>
  );
}

/* * ====== Små helpers ====== */

interface SectionProps {
  t: (key: string, options?: any) => string;
  titleKey: string;
  emptyKey: string;
  stats: Stats;
  loading: boolean;
  onAdd(): void;
  onSearch(): void;
  onLists(): void;
  recent: React.ReactNode;
}

function Section({
  t,
  titleKey,
  emptyKey,
  stats,
  loading,
  onAdd,
  onSearch,
  onLists,
  recent,
}: SectionProps) {
  // Visa bara tomt meddelande om vi är klara med laddningen och inga totala finns
  const showEmpty = !loading && stats.total === 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        {/* Tvingar uppslagning med enkel t(key) */}
        <h2 className="text-xl font-semibold">{t(titleKey)}</h2>
        <div className="flex gap-2">
          <button className="btn" onClick={onSearch}>{t("home.btn.search", "Sök")}</button>
          <button className="btn" onClick={onAdd}>{t("home.btn.add", "Lägg till")}</button>
          <button className="btn" onClick={onLists}>{t("home.btn.lists", "Listor")}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard t={t} labelKey="home.stats.total" value={stats.total} />
        <StatCard t={t} labelKey="home.stats.owned" value={stats.owned} />
        <StatCard t={t} labelKey="home.stats.digital" value={stats.digital} />
        <StatCard t={t} labelKey="home.stats.wish" value={stats.wish} />
        <StatCard t={t} labelKey="home.stats.lists" value={stats.lists} />
      </div>

      <div>
        <h3 className="font-semibold mb-2">{t("home.stats.latest", "Senast tillagda")}</h3>
        {loading ? (
          <EmptyLine label={t("loading", "Laddar...")} />
        ) : showEmpty ? (
          // Tvingar uppslagning med enkel t(key)
          <EmptyLine label={t(emptyKey)} />
        ) : (
          recent
        )}
      </div>
    </section>
  );
}

function StatCard({ t, labelKey, value }: { t: (key: string, options?: any) => string; labelKey: string; value: number }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      {/* Tvingar uppslagning med enkel t(key) */}
      <div className="text-sand-300 text-xs">{t(labelKey)}</div>
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="text-sand-300 text-sm">{label}</div>;
}
