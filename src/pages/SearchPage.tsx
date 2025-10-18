// src/pages/SearchPage.tsx
import { useEffect, useMemo, useState } from "react";
import { db, Movie } from "@/db";
import MovieCard from "@/components/MovieCard";

type Filter = "all" | "owned" | "digital" | "wish";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ms = await db.movies.orderBy("title").toArray();
      if (mounted) setMovies(ms);
    })();
    return () => { mounted = false; };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter(m => {
      if (filter === "owned" && !m.owned) return false;
      if (filter === "digital" && !m.digital) return false;
      if (filter === "wish" && !m.wishlisted) return false;

      if (!q) return true;
      const hay = [
        m.title,
        (m.genres || []).join(" "),
        m.location || "",
        m.provider || "",
        String(m.year || "")
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [movies, query, filter]);

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Titel, taggar, genrer…"
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
        {shown.map(m => <MovieCard key={m.id} movie={m} />)}
        {shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inget matchar din filtrering.</div>
        )}
      </div>
    </section>
  );
}