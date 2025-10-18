// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/db";

type Stats = { movies: number; lists: number };

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ movies: 0, lists: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const movies = (await (db as any)?.movies?.count?.()) ?? 0;
        const lists = (await (db as any)?.lists?.count?.()) ?? 0;
        if (mounted) setStats({ movies, lists });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const isEmpty = !loading && stats.movies === 0 && stats.lists === 0;

  return (
    <section className="p-4">
      {/* Hero – tydligt fokus på ägda filmer */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          Din samling, dina regler. Håll koll på <span className="font-semibold">ägda filmer</span>,
          bygg hyllor och hitta rätt titel på två sekunder – offline.
        </p>
      </div>

      {/* Snabb-actions anpassade för samling */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång med samlingen</h2>
            <p className="text-sand-300 text-sm">
              Lägg in en ägd film, skapa en “hylla” (lista) eller importera en backup.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/add")}>
              Lägg till ägd film
            </button>
            <Link to="/collections" className="btn">Skapa hylla</Link>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      </div>

      {/* Lätt statistik */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="chip">🎬 Filmer: {loading ? "…" : stats.movies}</span>
        <span className="chip">📚 Hyllor: {loading ? "…" : stats.lists}</span>
      </div>

      {/* Tomt-läge för ren samlingsapp */}
      {isEmpty && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold mb-1">Tomt just nu</h3>
          <p className="text-sand-300 text-sm mb-3">
            Börja med att lägga till en titel du äger, eller importera en JSON-backup från datorn/mobilen.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/add")}>
              Lägg till första filmen
            </button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      {/* Din existerande lista/kort renderas här nedanför som tidigare */}
    </section>
  );
}