// src/pages/CollectionsPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  createList,
  deleteList,
  getListCounts,
  getLists,
  renameList,
  type List, // ✅ ta List från db-typerna
} from "@/db";
import { Plus, Edit3, Trash2, Search, SortAsc, SortDesc, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type SortMode = "alpha" | "newest";

export default function CollectionsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({}); // ✅ numeriska nycklar
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("alpha");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const [ls, cs] = await Promise.all([getLists(), getListCounts()]);
    setLists(ls);
    setCounts(cs);
  }

  async function handleCreate() {
    const name = prompt('Namn på ny lista (t.ex. "Vampyrfilm", "Favoriter 2025")?');
    if (!name || !name.trim()) return;
    setBusy(true);
    await createList(name.trim());
    await load();
    setBusy(false);
  }

  async function handleRename(list: List) {
    const name = prompt("Byt namn på lista:", list.name);
    if (!name || !name.trim() || name.trim() === list.name) return;
    setBusy(true);
    await renameList(list.id!, name.trim()); // ✅ id finns på sparade listor
    await load();
    setBusy(false);
  }

  async function handleDelete(list: List) {
    if (!confirm(`Ta bort listan "${list.name}"? (Filmerna ligger kvar, bara listan försvinner)`)) return;
    setBusy(true);
    await deleteList(list.id!); // ✅ id finns på sparade listor
    await load();
    setBusy(false);
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = needle
      ? lists.filter((l) => l.name.toLowerCase().includes(needle))
      : lists.slice();

    base.sort((a, b) => {
      if (sort === "alpha") return a.name.localeCompare(b.name, "sv");
      // nyast först
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return base;
  }, [lists, q, sort]);

  return (
    <section className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Samlingar</h1>
        <button className="btn btn-primary" onClick={handleCreate} disabled={busy}>
          <Plus size={16} className="mr-1" />
          Ny lista
        </button>
      </div>

      {/* Sök + sort */}
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
              className={`chip ${sort === "alpha" ? "bg-accent-500 text-white" : ""}`}
              onClick={() => setSort("alpha")}
              title="Sortera A–Ö"
            >
              <SortAsc size={14} />
              A–Ö
            </button>
            <button
              className={`chip ${sort === "newest" ? "bg-accent-500 text-white" : ""}`}
              onClick={() => setSort("newest")}
              title="Senast skapad"
            >
              <SortDesc size={14} />
              Nyast
            </button>
          </div>
        </div>
      </div>

      {/* Tomt-läge */}
      {filtered.length === 0 && (
        <div className="card p-6">
          {lists.length === 0 ? (
            <div>
              <p>Du har inga listor ännu.</p>
              <p className="text-sand-300 text-sm mt-1">
                Tryck <strong>Ny lista</strong> för att skapa din första – t.ex. <em>Vampyrfilm</em>,{" "}
                <em>Favoriter 2025</em> eller <em>Comfort</em>.
              </p>
            </div>
          ) : (
            <p>Inga träffar på ”{q}”.</p>
          )}
        </div>
      )}

      {/* Listor */}
      <div className="space-y-3">
        {filtered.map((l) => {
          const id = l.id!; // ✅ vi har id på lagrade rader
          const count = counts[id] ?? 0;

          return (
            <article key={id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/collections/${id}`} className="font-semibold truncate hover:underline">
                    {l.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="chip">
                      {count} film{count === 1 ? "" : "er"}
                    </span>
                    <span className="text-sand-300 text-xs">
                      Skapad {new Date(l.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/collections/${id}`} className="chip hover:opacity-90" title="Öppna">
                    <ExternalLink size={14} />
                    Öppna
                  </Link>
                  <button
                    className="chip hover:opacity-90"
                    onClick={() => handleRename(l)}
                    title="Byt namn"
                    disabled={busy}
                  >
                    <Edit3 size={14} />
                    Byt namn
                  </button>
                  <button
                    className="chip hover:opacity-90"
                    onClick={() => handleDelete(l)}
                    title="Ta bort lista"
                    disabled={busy}
                  >
                    <Trash2 size={14} />
                    Ta bort
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