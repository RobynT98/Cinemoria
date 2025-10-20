// src/pages/movie/MovieSearch.tsx
import { useEffect, useMemo, useState } from "react";
import { db, type Movie } from "@/db";
import MovieCard from "@/components/MovieCard";
import MovieDetailsDialog from "@/components/MovieDetailsDialog";

type Filter = "all" | "owned" | "digital" | "wish";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // detalj-dialog
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ms = await db.movies.orderBy("title").toArray();
        if (alive) setMovies(ms);
      } catch (e: any) {
        console.error("MovieSearch load error:", e);
        if (alive) setErrMsg(e?.message || "Kunde inte läsa databasen.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((m) => {
      if (filter === "owned" && !m.owned) return false;
      if (filter === "digital" && !m.digital) return false;
      if (filter === "wish" && !m.wishlisted) return false;

      if (!q) return true;
      const hay = [
        m.title,
        (m.genres || []).join(" "),
        m.location || "",
        m.provider || "",
        String(m.year || ""),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [movies, query, filter]);

  return (
    <section className="p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      {/* Sökfält och filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Titel, taggar, genrer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          inputMode="search"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">Alla</option>
          <option value="owned">Ägd</option>
          <option value="digital">Digital</option>
          <option value="wish">Önskelista</option>
        </select>
      </div>

      {/* Felmeddelande (blockera aldrig rendering) */}
      {errMsg && (
        <div className="card p-3 mb-3 text-sm">
          <div className="font-semibold mb-1">Något gick fel</div>
          <div className="text-sand-300">{errMsg}</div>
        </div>
      )}

      {/* Resultatlista */}
      <div className="space-y-2">
        {shown.map((m) => (
          <MovieCard
            key={m.id ?? m.title}
            movie={m}
            compact
            onOpenDetails={() => {
              setSelected(m);
              setOpen(true);
            }}
          />
        ))}

        {!loading && shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inget matchar din filtrering.</div>
        )}
      </div>

      {/* Detalj-dialog – mounta bara när vi faktiskt ska visa */}
      {open && selected && (
        <MovieDetailsDialog
          open={open}
          movie={selected}
          onClose={() => {
            setOpen(false);
            // lämna kvar selected för snabb återöppning, men nolla om du vill:
            // setSelected(null);
          }}
        />
      )}
    </section>
  );
}