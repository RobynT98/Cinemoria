// src/pages/comic/ComicSearch.tsx
import { useEffect, useMemo, useState } from "react";
import { db, type Comic } from "@/db";
import ComicCard from "@/components/ComicCard";
import ComicDetailsDialog from "@/components/ComicDetailsDialog";

type Filter = "all" | "owned" | "digital" | "wish";

export default function ComicSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Comic | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await db.comics.orderBy("title").toArray();
        if (alive) setComics(list);
      } catch (e: any) {
        console.error("ComicSearch load error:", e);
        if (alive) setErrMsg(e?.message || "Kunde inte läsa databasen.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return comics.filter((c) => {
      if (filter === "owned" && !c.owned) return false;
      if (filter === "digital" && !c.digital) return false;
      if (filter === "wish" && !c.wishlisted) return false;

      if (!q) return true;

      // Stöd både nya och gamla namn (seriesTitle/issueNumber resp. series/issue)
      const series = (c as any).seriesTitle ?? c.series ?? "";
      const issue  = (c as any).issueNumber ?? c.issue ?? "";

      const hay = [
        c.title,
        series,
        String(issue || ""),
        String(c.volume || ""),
        (c.genres || []).join(" "),
        c.publisher || "",
        c.language || "",
        c.format || "",
        c.barcode || "",
        String(c.year || ""),
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });
  }, [comics, query, filter]);

  return (
    <section className="p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Sök titel, serie, nummer, förlag…"
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

      {errMsg && (
        <div className="card p-3 mb-3 text-sm">
          <div className="font-semibold mb-1">Något gick fel</div>
          <div className="text-sand-300">{errMsg}</div>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((c) => (
          <div
            key={c.id ?? c.title}
            role="button"
            tabIndex={0}
            onClick={() => { setSelected(c); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(c); setOpen(true);
              }
            }}
            className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-600 rounded-2xl"
          >
            <ComicCard comic={c} />
          </div>
        ))}

        {!loading && shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inga träffar.</div>
        )}
      </div>

      {open && selected && (
        <ComicDetailsDialog open={open} comic={selected} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}