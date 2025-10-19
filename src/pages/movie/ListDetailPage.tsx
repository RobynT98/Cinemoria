// src/pages/movie/ListDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  db,
  type Movie,
  type List as DbList,
  getListById,
  getMoviesInList,
  linkMovieToList,
  unlinkMovieFromList,
  renameList,
  deleteList,
} from "@/db";
import { Plus, Trash2, Edit3, ArrowLeft, X, Search } from "lucide-react";

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = Number(params.id);
  const nav = useNavigate();

  const [list, setList] = useState<DbList | undefined>();
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [inList, setInList] = useState<Movie[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(listId)) {
      setNotFound(true);
      return;
    }
    (async () => {
      const [l, movies, mIn] = await Promise.all([
        getListById(listId),
        db.movies.toArray(),
        getMoviesInList(listId),
      ]);
      if (!l) {
        setNotFound(true);
        return;
      }
      setList(l);
      setAllMovies(movies);
      setInList(mIn);
    })();
  }, [listId]);

  const notInList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const inSet = new Set(inList.map((m) => m.id));
    let base = allMovies.filter((m) => !inSet.has(m.id!));
    if (needle) {
      base = base.filter(
        (m) =>
          m.title.toLowerCase().includes(needle) ||
          String(m.year || "").includes(needle)
      );
    }
    return base.sort((a, b) => a.title.localeCompare(b.title, "sv"));
  }, [allMovies, inList, q]);

  async function handleAdd(m: Movie) {
    setBusy(true);
    try {
      await linkMovieToList(listId, m.id!);
      setInList(await getMoviesInList(listId));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(m: Movie) {
    setBusy(true);
    try {
      await unlinkMovieFromList(listId, m.id!);
      setInList(await getMoviesInList(listId));
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
      await renameList(list.id!, name.trim());
      setList(await getListById(listId));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!list) return;
    if (
      !confirm(
        `Ta bort listan "${list.name}"? (Filmerna ligger kvar, bara listan försvinner)`
      )
    )
      return;
    setBusy(true);
    try {
      await deleteList(list.id!);
      nav("/movie/collections");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/movie/collections" className="chip">
            <ArrowLeft size={16} /> Tillbaka
          </Link>
          <h1 className="text-2xl font-semibold">Listan hittades inte</h1>
        </div>
        <p className="text-sand-300">
          Antingen finns den inte, eller så var länken ogiltig.
        </p>
      </section>
    );
  }

  return (
    <section className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/movie/collections" className="chip">
            <ArrowLeft size={16} />
            Tillbaka
          </Link>
          <h1 className="text-2xl font-semibold truncate">
            {list?.name ?? "Lista"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="chip" onClick={handleRename} disabled={busy}>
            <Edit3 size={14} />
            Byt namn
          </button>
          <button className="chip" onClick={handleDelete} disabled={busy}>
            <Trash2 size={14} />
            Ta bort
          </button>
        </div>
      </div>

      {/* Innehåll i listan */}
      <div className="card p-4">
        <h2 className="font-semibold mb-2">
          Filmer i listan{" "}
          <span className="text-sand-300 text-sm">({inList.length} st)</span>
        </h2>

        {inList.length === 0 ? (
          <p className="text-sand-300 text-sm">
            Inga filmer än. Lägg till från rutan nedan.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {inList
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title, "sv"))
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 border-b border-ink-700/30 pb-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.title}</div>
                    <div className="text-sand-300 text-xs">
                      {m.year ?? "År saknas"}
                      {m.format ? ` • ${labelFormat(m.format)}` : ""}
                      {m.edition ? ` • ${m.edition}` : ""}
                    </div>
                  </div>
                  <button
                    className="chip"
                    onClick={() => handleRemove(m)}
                    disabled={busy}
                    title="Ta bort från listan"
                  >
                    <X size={14} />
                    Ta bort
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Lägg till från befintliga filmer */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Lägg till film</h2>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
          />
          <input
            className="pl-9"
            type="text"
            placeholder="Sök i ditt bibliotek…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {notInList.length === 0 ? (
          <p className="text-sand-300 text-sm">
            {allMovies.length === 0
              ? "Du har inga filmer i biblioteket ännu."
              : q
              ? "Inga träffar utanför listan."
              : "Alla filmer du har ligger redan i listan."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notInList.slice(0, 30).map((m) => (
              <button
                key={m.id}
                className="chip justify-between"
                onClick={() => handleAdd(m)}
                disabled={busy}
                title="Lägg till i listan"
              >
                <span className="truncate">
                  {m.title} {m.year ? `(${m.year})` : ""}
                </span>
                <Plus size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function labelFormat(f?: Movie["format"]) {
  switch (f) {
    case "uhd":
      return "4K UHD";
    case "bluray":
      return "Blu-ray";
    case "dvd":
      return "DVD";
    case "digital":
      return "Digital";
    case "vhs":
      return "VHS";
    default:
      return "Övrigt";
  }
}