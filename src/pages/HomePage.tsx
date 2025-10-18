// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Antag att db exporteras från '@/db' (Dexie-instans med tables: movies, lists)
import { db } from "@/db";

type Stats = {
  movies: number;
  lists: number;
  seen?: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ movies: 0, lists: 0, seen: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const movies = (await (db as any)?.movies?.count?.()) ?? 0;
        const lists = (await (db as any)?.lists?.count?.()) ?? 0;

        // Försök räkna “sett” om fältet finns (tål att saknas)
        let seen = 0;
        try {
          seen =
            (await (db as any)?.movies
              ?.where?.("seen")
              ?.equals?.(true)
              ?.count?.()) ?? 0;
        } catch {
          seen = undefined;
        }

        if (mounted) setStats({ movies, lists, seen });
      } catch {
        if (mounted) setStats({ movies: 0, lists: 0, seen: 0 });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isEmpty = !loading && stats.movies === 0 && stats.lists === 0;

  return (
    <section className="p-4">
      {/* Hero / Intro */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          Din filmvärld, offline och snabb. Här dyker senast tillagda upp.
        </p>
      </div>

      {/* Snabb-actions */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Snabbstart</h2>
            <p className="text-sand-300 text-sm">
              Lägg till din första film, skapa en samling eller importera en backup.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/add")}>
              Lägg till film
            </button>
            <Link to="/collections" className="btn">Skapa lista</Link>
            <Link to="/profile" className="btn">Importera</Link>
          </div>
        </div>
      </div>

      {/* Små-statistik */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="chip">🎬 Filmer: {loading ? "…" : stats.movies}</span>
        <span className="chip">📚 Listor: {loading ? "…" : stats.lists}</span>
        {typeof stats.seen === "number" && (
          <span className="chip">✅ Sett: {loading ? "…" : stats.seen}</span>
        )}
      </div>

      {/* Tomt-läge (om ingen data) */}
      {isEmpty && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold mb-1">Du har inga filmer eller listor ännu</h3>
          <p className="text-sand-300 text-sm mb-3">
            Börja med att lägga till en film. Du kan alltid importera/exportera via{" "}
            <Link to="/profile" className="underline">Profil</Link>.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/add")}>
              Lägg till din första film
            </button>
            <Link to="/collections" className="btn">Skapa din första lista</Link>
          </div>
        </div>
      )}

      {/* ————————————————————————————————
          Här under renderar du redan dina filmkort.
          Låt din befintliga lista ligga kvar precis som den är.
          ———————————————————————————————— */}
    </section>
  );
}