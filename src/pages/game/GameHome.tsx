// src/pages/game/GameHome.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Game } from "@/db";
import { getRecentGames } from "@/db";
import GameCard from "@/components/game/GameCard";

type Stat = {
  total: number;
  owned: number;
  digital: number;
  wish: number;
};

export default function GameHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Game[]>([]);
  const [stats, setStats] = useState<Stat>({
    total: 0,
    owned: 0,
    digital: 0,
    wish: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [total, owned, digital, wish, recentGames] = await Promise.all([
          db.games.count(),
          db.games.filter((g) => !!g.owned).count(),
          db.games.filter((g) => !!g.digital).count(),
          db.games.filter((g) => !!g.wishlisted).count(),
          getRecentGames(12),
        ]);
        if (!alive) return;
        setStats({ total, owned, digital, wish });
        setRecent(recentGames);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const empty = !loading && stats.total === 0;

  return (
    <section className="p-4 space-y-4">
      {/* Hero */}
      <header>
        <h1 className="text-2xl font-semibold">Spel</h1>
        <p className="text-sand-300">
          Logga ägda spel, digitala titlar och önskelista — helt offline.
        </p>
      </header>

      {/* Snabbstart */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">
              Lägg till ett spel, sök i din samling, bygg listor eller importera en backup via Profil.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/game/add")}>
              Lägg till spel
            </button>
            <Link to="/game/search" className="btn">Sök</Link>
            <Link to="/game/collections" className="btn">Listor</Link>
            <Link to="/profile" className="btn">Importera</Link>
          </div>
        </div>
      </div>

      {/* Nyckeltal */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Spel" value={stats.total} />
        <StatCard label="Ägda" value={stats.owned} />
        <StatCard label="Digitalt" value={stats.digital} />
        <StatCard label="Önskelista" value={stats.wish} />
      </section>

      {/* Tomt-läge */}
      {empty && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Din spelhylla väntar 🎮</h3>
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

      {/* Senast tillagda */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Senast tillagda</h2>
        {recent.length > 0 && (
            <Link to="/game/search" className="text-sm hover:underline">
              Visa fler
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {recent.map((g) => (
            <GameCard key={g.id} game={g} />
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