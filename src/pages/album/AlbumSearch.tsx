// src/pages/album/AlbumSearch.tsx
import { useEffect, useMemo, useState } from "react";
import { db, type Album } from "@/db";
import AlbumCard from "@/components/AlbumCard";
import AlbumDetailsDialog from "@/components/AlbumDetailsDialog";

type Filter = "all" | "owned" | "digital" | "wish";

export default function AlbumSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Album | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await db.albums.orderBy("title").toArray();
        if (alive) setAlbums(list);
      } catch (e: any) {
        console.error("AlbumSearch load error:", e);
        if (alive) setErrMsg(e?.message || "Kunde inte läsa databasen.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return albums.filter((a) => {
      if (filter === "owned" && !a.owned) return false;
      if (filter === "digital" && !a.digital) return false;
      if (filter === "wish" && !a.wishlisted) return false;

      if (!q) return true;

      const hay = [
        a.title,
        a.artist || "",
        (a.genres || []).join(" "),
        a.label || "",
        a.language || "",
        a.format || "",
        a.barcode || "",
        String(a.year || ""),
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });
  }, [albums, query, filter]);

  return (
    <section className="p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Sök titel, artist, etikett…"
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
        {shown.map((a) => (
          <div
            key={a.id ?? a.title}
            role="button"
            tabIndex={0}
            onClick={() => { setSelected(a); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(a); setOpen(true);
              }
            }}
            className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-600 rounded-2xl"
          >
            <AlbumCard album={a} />
          </div>
        ))}

        {!loading && shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inga träffar.</div>
        )}
      </div>

      {open && selected && (
        <AlbumDetailsDialog open={open} album={selected} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}