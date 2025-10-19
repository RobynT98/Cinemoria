import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentGames } from "@/db"; // du lägger till detta sen i db.ts
import type { Game } from "@/db";
import { PlusCircle } from "lucide-react";

export default function GameHome() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    getRecentGames(10).then(setGames).catch(console.error);
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Senaste tillagda</h2>

      {games.length === 0 ? (
        <div className="text-sm text-ink-600 dark:text-sand-400">
          Inga spel ännu.{" "}
          <Link to="/game/add" className="underline">
            Lägg till ditt första spel
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {games.map((game) => (
            <li
              key={game.id}
              className="border rounded-xl p-3 bg-white/70 dark:bg-ink-800/50 sepia:bg-[#f7efd4]/70 hover:shadow-sm transition"
            >
              <Link to={`/game/edit/${game.id}`} className="flex items-center gap-3">
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-sand-200 dark:bg-ink-700 rounded flex items-center justify-center text-sand-700 dark:text-sand-300">
                    🎮
                  </div>
                )}
                <div>
                  <p className="font-medium">{game.title}</p>
                  {game.platform && (
                    <p className="text-xs text-ink-600 dark:text-sand-400">
                      {game.platform}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-4">
        <Link
          to="/game/add"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sand-200 hover:bg-sand-300 dark:bg-ink-700 dark:hover:bg-ink-600 sepia:bg-[#e8d6a4] sepia:hover:bg-[#e0c982] transition"
        >
          <PlusCircle size={18} />
          Lägg till spel
        </Link>
      </div>
    </section>
  );
}