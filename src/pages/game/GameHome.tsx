import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Game } from "@/db";
import { getGameLists, getGameListCounts } from "@/db";
import GameCard from "@/components/game/GameCard";

type ListPreview = { id: number; name: string; count: number; createdAt: number };

export default function GameHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Game[]>([]);
  const [stats, setStats] = useState({
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
          recentGames,
          lists,
          listCounts,
        ] = await Promise.all([
          db.games.count(),
          db.games.filter((g) => !!g.owned).count(),
          db.games.filter((g) => !!g.digital).count(),
          db.games.filter((g) => !!g.wishlisted).count(),
          db.gameLists.count(),
          db.games.orderBy("createdAt").reverse().limit(12).toArray(),
          getGameLists(),
          getGameListCounts(),
        ]);

        if (!alive) return;

        setStats({ total, owned, digital, wish, lists: listsCount });
        setRecent(recentGames);

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

  const showEmptyWelcome = !loading && stats.total === 0 && stats.lists === 0;

  return (
    <section className="p-4 space-y-4">
      {/* Hero */}
      <header>
        <h1 className="text-2xl font-semibold">🎮 Spel</h1>
        <p className="text-sand-300">
          Håll koll på bibliotek, plattformar och önskelista — offline och snabbt.
        </p>
      </header>

      {/* Snabbstart */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">
              Lägg till ett spel, sök i biblioteket eller bygg en spellista.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/game/add")}>
              Lägg till spel
            </button>
            <Link to="/game/search" className="btn">Sök</Link>
            <Link to="/game/collections" className="btn">Skapa lista</Link>
          </div>
        </div>
      </div>

      {/* Nyckeltal */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatCard label="Spel" value={stats.total} />
        <StatCard label="Ägda" value={stats.owned} />
        <StatCard label="Digitalt" value={stats.digital} />
        <StatCard label="Önskelista" value={stats.wish} />
        <StatCard label="Listor" value={stats.lists} />
      </section>

      {/* Tomt läge */}
      {showEmptyWelcome && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Ditt bibliotek väntar ✨</h3>
          <p className="text-sand-300 text-sm mb-3">
            Lägg till ditt första spel eller importera från JSON-backup under Profil.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/game/add")}>
              Lägg till spel
            </button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      {/* Mina listor */}
      {listsPreview.length > 0 && (
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Mina listor</h2>
            <Link to="/game/collections" className="text-sm hover:underline">Visa alla</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {listsPreview.map((l) => (
              <Link
                key={l.id}
                to={`/game/collections/${l.id}`}
                className="chip no-underline hover:opacity-90 flex items-center justify-between"
              >
                <span className="truncate">{l.name}</span>
                <span className="text-xs opacity-80">
                  {l.count} spel
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Senast tillagda */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Senast tillagda</h2>
          {recent.length > 0 && (
            <Link to="/game/search" className="text-sm hover:underline">Visa fler</Link>
          )}
        </div>
        <div className="space-y-3">
          {recent.map((g) => (
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
          {!loading && recent.length === 0 && (
            <div className="text-sand-300 text-sm">Inga spel ännu.</div>
          )}
        </div>
      </section>
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