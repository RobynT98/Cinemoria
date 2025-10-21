import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, type Comic, type ComicList as DbList } from "@/db";
import { Plus, Trash2, Edit3, ArrowLeft, X, Search } from "lucide-react";

export default function ComicListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = Number(params.id);
  const nav = useNavigate();

  const [list, setList] = useState<DbList | undefined>();
  const [allComics, setAllComics] = useState<Comic[]>([]);
  const [inList, setInList] = useState<Comic[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(listId)) { setNotFound(true); return; }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  async function reload() {
    try {
      const [l, comics] = await Promise.all([db.comicLists.get(listId), db.comics.toArray()]);
      if (!l) { setNotFound(true); return; }
      setList(l);
      setAllComics(comics);

      const links = await db.comicList.where("listId").equals(listId).toArray();
      const ids = new Set<number>((links as any[]).map((ln) => Number(ln.comicId)));
      const inside = comics.filter((c) => typeof c.id === "number" && ids.has(Number(c.id)));
      setInList(inside);
    } catch (err) {
      console.error("Comic list reload failed:", err);
      alert("Kunde inte läsa listan. Prova att ladda om.");
    }
  }

  const notInList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const inSet = new Set(inList.map((c) => c.id));
    let base = allComics.filter((c) => !inSet.has(c.id!));
    if (needle) {
      base = base.filter(
        (c) =>
          c.title.toLowerCase().includes(needle) ||
          (c.series || "").toLowerCase().includes(needle) ||
          String(c.year || "").includes(needle)
      );
    }
    return base.sort((a, b) => a.title.localeCompare(b.title, "sv"));
  }, [allComics, inList, q]);

  async function handleAdd(c: Comic) {
    if (!c.id) return;
    setBusy(true);
    try {
      const exists = await db.comicList.where({ listId, comicId: c.id }).first();
      if (!exists) await db.comicList.add({ listId, comicId: c.id, createdAt: Date.now() } as any);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(c: Comic) {
    if (!c.id) return;
    setBusy(true);
    try {
      const link = await db.comicList.where({ listId, comicId: c.id }).first();
      if ((link as any)?.id) await db.comicList.delete((link as any).id);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function handleRename() {
    if (!list) return;
    const name = prompt("Byt namn på listan:", list.name);
    if (!name || !name.trim() || name === list.name) return;
    setBusy(true);
    try {
      await db.comicLists.update(list.id!, { name: name.trim(), updatedAt: Date.now() });
      setList(await db.comicLists.get(listId));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!list) return;
    if (!confirm(`Ta bort listan "${list.name}"? (Serierna ligger kvar)`)) return;
    setBusy(true);
    try {
      const links = await db.comicList.where("listId").equals(listId).toArray();
      await db.transaction("rw", [db.comicList, db.comicLists], async () => {
        for (const ln of links as any[]) if (ln.id) await db.comicList.delete(ln.id);
        await db.comicLists.delete(list.id!);
      });
      nav("/comic/collections");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/comic/collections" className="chip"><ArrowLeft size={16} /> Tillbaka</Link>
          <h1 className="text-2xl font-semibold">Listan hittades inte</h1>
        </div>
        <p className="text-sand-300">Antingen finns den inte, eller så var länken ogiltig.</p>
      </section>
    );
  }

  return (
    <section className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/comic/collections" className="chip"><ArrowLeft size={16} /> Tillbaka</Link>
          <h1 className="text-2xl font-semibold truncate">{list?.name ?? "Lista"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="chip" onClick={handleRename} disabled={busy}><Edit3 size={14} /> Byt namn</button>
          <button className="chip" onClick={handleDelete} disabled={busy}><Trash2 size={14} /> Ta bort</button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">
          Serier i listan <span className="text-sand-300 text-sm">({inList.length} st)</span>
        </h2>

        {inList.length === 0 ? (
          <p className="text-sand-300 text-sm">Inga serier än. Lägg till från rutan nedan.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {inList.slice().sort((a, b) => a.title.localeCompare(b.title, "sv")).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 border-b border-ink-700/30 pb-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-sand-300 text-xs">
                    {(c.series || "Fristående") + (c.year ? ` • ${c.year}` : "") + (c.format ? ` • ${labelComicFormat(c.format)}` : "")}
                  </div>
                </div>
                <button className="chip" onClick={() => handleRemove(c)} disabled={busy} title="Ta bort från listan">
                  <X size={14} /> Ta bort
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Lägg till serie</h2>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input className="pl-9" type="text" placeholder="Sök i ditt bibliotek…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {notInList.length === 0 ? (
          <p className="text-sand-300 text-sm">
            {allComics.length === 0 ? "Du har inga serier i biblioteket ännu."
              : q ? "Inga träffar utanför listan."
              : "Alla serier du har ligger redan i listan."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notInList.slice(0, 30).map((c) => (
              <button key={c.id} className="chip justify-between" onClick={() => handleAdd(c)} disabled={busy} title="Lägg till i listan">
                <span className="truncate">{c.title} {c.year ? `(${c.year})` : ""}</span>
                <Plus size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function labelComicFormat(f?: Comic["format"]) {
  switch (f) {
    case "paperback": return "Häftad";
    case "hardcover": return "Inbunden";
    case "digital": return "Digital";
    case "magazine": return "Tidning";
    default: return "Övrigt";
  }
}