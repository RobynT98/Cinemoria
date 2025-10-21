import { useEffect, useMemo, useState } from "react";
import { db, type Album } from "@/db";
import AlbumCard from "@/components/AlbumCard";

export default function AlbumSearch() {
  const [q, setQ] = useState("");
  const [all, setAll] = useState<Album[]>([]);

  useEffect(() => { db.albums.toArray().then(setAll); }, []);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return all.slice().reverse();
    return all.filter(a =>
      a.title.toLowerCase().includes(n) ||
      (a.artist || "").toLowerCase().includes(n) ||
      String(a.year || "").includes(n)
    );
  }, [all, q]);

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Sök album</h1>
      <input placeholder="Sök titel/artist/år…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="space-y-2">
        {list.map(a => <AlbumCard key={a.id} album={a} />)}
        {list.length === 0 && <div className="text-sand-300 text-sm">Inga träffar.</div>}
      </div>
    </section>
  );
}