import { useEffect, useMemo, useState } from "react";
import { db, type GameList } from "@/db";
import { Plus, Edit3, Trash2, Search, SortAsc, SortDesc, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type SortMode = "alpha" | "newest";

export default function GameCollectionsPage() {
  const [lists, setLists] = useState<GameList[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("alpha");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    // Hämta listor
    const ls = await db.gameLists.toArray();
    setLists(ls);

    // Räkna länkar per lista via länktabellen "gameList"
    const links = await db.gameList.toArray();
    const c: Record<number, number> = {};
    for (const ln of links) {
      const lid = Number((ln as any).listId);
      c[lid] = (c[lid] ?? 0) + 1;
    }
    setCounts(c);
  }

  async function handleCreate() {
    const name = prompt('Namn på ny spellista (t.ex. "Backlogg", "Co-op", "PS5")?');
    if (!name || !name.trim()) return;
    setBusy(true);
    try {
      const now = Date.now();
      await db.gameLists.add({ name: name.trim(), createdAt: now, updatedAt: now } as GameList);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(list: GameList) {
    const name = prompt("Byt namn på lista:", list.name);
    if (!name || !name.trim() || name.trim() === list.name) return;
    setBusy(true);
    try {
      await db.gameLists.update(list.id!, { name: name.trim(), updatedAt: Date.now() });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(list: GameList) {
    if (!confirm(`Ta bort listan "${list.name}"? (Spelen ligger kvar, bara listan försvinner)`)) return;
    setBusy(true);
    try {
      const links = await db.gameList.where("listId").equals(list.id!).toArray();
      await db.transaction("rw", [db.gameList, db.gameLists], async () => {
        for (const ln of links) if ((ln as any).id) await db.gameList.delete((ln as any).id);
        await db.gameLists.delete(list.id!);
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = needle ? lists.filter((l) => l.name.toLowerCase().includes(needle)) : lists.slice();
    base.sort((a, b) =>
      sort === "alpha"
        ? a.name.localeCompare(b.name, "sv")
        : (b.createdAt || 0) - (a.createdAt || 0) // nyast först
    );
    return base;
  }, [lists, q, sort]);

  return (
    <section className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Spellistor</h1>
        <button className="btn btn-primary" onClick={handleCreate} disabled={busy}>
          <Plus size={16} className="mr-1" />
          Ny lista
        </button>
      </div>

      <div className="card p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              placeholder="Sök efter listnamn…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`chip ${sort === "alpha" ? "tab-active" : ""}`}
              onClick={() => setSort("alpha")}
              title="Sortera A–Ö"
              type="button"
            >
              <SortAsc size={14} /> A–Ö
            </button>
            <button
              className={`chip ${sort === "newest" ? "tab-active" : ""}`}
              onClick={() => setSort("newest")}
              title="Senast skapad"
              type="button"
            >
              <SortDesc size={14} /> Nyast
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card p-6">
          {lists.length === 0 ? <p>Du har inga spellistor ännu. Skapa din första.</p> : <p>Inga träffar på ”{q}”.</p>}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((l) => {
          const id = l.id!;
          const count = counts[id] ?? 0;
          return (
            <article key={id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/game/collections/${id}`} className="font-semibold truncate hover:underline">
                    {l.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="chip">{count} spel</span>
                    <span className="text-sand-300 text-xs">
                      Skapad {new Date(l.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/game/collections/${id}`} className="chip hover:opacity-90" title="Öppna">
                    <ExternalLink size={14} /> Öppna
                  </Link>
                  <button className="chip hover:opacity-90" onClick={() => handleRename(l)} title="Byt namn" disabled={busy}>
                    <Edit3 size={14} /> Byt namn
                  </button>
                  <button className="chip hover:opacity-90" onClick={() => handleDelete(l)} title="Ta bort lista" disabled={busy}>
                    <Trash2 size={14} /> Ta bort
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}