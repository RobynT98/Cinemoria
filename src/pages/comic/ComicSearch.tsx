import { useEffect, useMemo, useState } from "react";
import { db, type Comic } from "@/db";
import ComicCard from "@/components/ComicCard";

export default function ComicSearch() {
  const [q, setQ] = useState("");
  const [all, setAll] = useState<Comic[]>([]);
  useEffect(() => { db.comics.toArray().then(setAll); }, []);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return all.slice().reverse();
    return all.filter(c =>
      c.title.toLowerCase().includes(n) ||
      (c.series || "").toLowerCase().includes(n) ||
      String(c.issue || "").includes(n) ||
      String(c.year || "").includes(n)
    );
  }, [all, q]);

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Sök serier</h1>
      <input placeholder="Sök titel/serie/nummer/år…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="space-y-2">
        {list.map(c => <ComicCard key={c.id} comic={c} />)}
        {list.length === 0 && <div className="text-sand-300 text-sm">Inga träffar.</div>}
      </div>
    </section>
  );
}