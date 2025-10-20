import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Game } from "@/db";
import GameCard from "@/components/game/GameCard";
import GameDetailsDialog from "@/components/GameDetailsDialog";

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

  // dialog
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Game | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // List-count: om tabellen saknas -> 0
        const anyDb = db as any;
        const listsCount = anyDb.gameLists?.count ? await anyDb.gameLists.count() : 0;

        const [total, owned, digital, wish, recentGames] = await Promise.all([
          db.games.count(),
          db.games.filter((g) => !!g.owned).count(),
          db.games.filter((g) => !!g.digital).count(),
          db.games.filter((g) => !!g.wishlisted).count(),
          db.games.orderBy("createdAt").reverse().limit(12).toArray(),
        ]);

        if (!alive) return;

        setStats({ total, owned, digital, wish, lists: listsCount });
        setRecent(recentGames);
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
      <header>
        <h1 className="text-2xl font-semibold">🎮 Spel</h1>
        <p className="text-sand-300">Håll koll på bibliotek, plattformar och önskelista — offline.</p>
      </header>

      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">Lägg till ett spel, sök eller bygg en spellista.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/game/add")}>Lägg till spel</button>
            <Link to="/game/search" className="btn">Sök</Link>
            <Link to="/game/collections" className="btn">Skapa lista</Link>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatCard label="Spel" value={stats.total} />
        <StatCard label="Ägda" value={stats.owned} />
        <StatCard label="Digitalt" value={stats.digital} />
        <StatCard label="Önskelista" value={stats.wish} />
        <StatCard label="Listor" value={stats.lists} />
      </section>

      {showEmptyWelcome && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Din spelhylla väntar ✨</h3>
          <p className="text-sand-300 text-sm mb-3">Lägg till ditt första spel eller importera backup via Profil.</p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/game/add")}>Lägg till spel</button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Senast tillagda</h2>
          {recent.length > 0 && <Link to="/game/search" className="text-sm hover:underline">Visa fler</Link>}
        </div>
        <div className="space-y-3">
          {recent.map((g) => (
            <div
              key={g.id}
              role="button"
              tabIndex={0}
              onClick={() => { setSelected(g); setOpen(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(g); setOpen(true);} }}
              className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-600 rounded-2xl"
            >
              <GameCard
                id={g.id}
                title={g.title}
                platform={g.platform}
                year={g.year}
                coverUrl={g.coverUrl}
                owned={g.owned}
                digital={g.digital}
                wishlisted={g.wishlisted}
              />
            </div>
          ))}
          {!loading && recent.length === 0 && (<div className="text-sand-300 text-sm">Inga spel ännu.</div>)}
        </div>
      </section>

      <GameDetailsDialog open={open} game={selected} onClose={() => setOpen(false)} />
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