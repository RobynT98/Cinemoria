import { useEffect, useMemo, useState } from "react";
import { db, type Game } from "@/db";
import GameCard from "@/components/game/GameCard";

type Filter = "all" | "owned" | "digital" | "wish";

export default function GameSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const gs = await db.games.orderBy("title").toArray();
      if (mounted) setGames(gs);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      if (filter === "owned" && !g.owned) return false;
      if (filter === "digital" && !g.digital) return false;
      if (filter === "wish" && !g.wishlisted) return false;

      if (!q) return true;

      const hay = [
        g.title,
        g.platform || "",
        String(g.year || ""),
        g.notes || "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [games, query, filter]);

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Titel, plattform, anteckningar…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">Alla</option>
          <option value="owned">Ägd</option>
          <option value="digital">Digital</option>
          <option value="wish">Önskelista</option>
        </select>
      </div>

      <div className="space-y-3">
        {shown.map((g) => (
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
          />
        ))}
        {shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inga spel ännu.</div>
        )}
      </div>
    </section>
  );
}