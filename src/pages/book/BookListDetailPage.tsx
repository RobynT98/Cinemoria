import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  db,
  type Book,
  type BookList as DbList,
  getBookListById,
  getBooksInBookList,
  linkBookToList,
  unlinkBookFromList,
  renameBookList,
  deleteBookList,
} from "@/db";
import { Plus, Trash2, Edit3, ArrowLeft, X, Search } from "lucide-react";

export default function BookListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = Number(params.id);
  const nav = useNavigate();

  const [list, setList] = useState<DbList | undefined>();
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [inList, setInList] = useState<Book[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(listId)) {
      setNotFound(true);
      return;
    }
    (async () => {
      const [l, books, bIn] = await Promise.all([
        getBookListById(listId),
        db.books.toArray(),
        getBooksInBookList(listId),
      ]);
      if (!l) {
        setNotFound(true);
        return;
      }
      setList(l);
      setAllBooks(books);
      setInList(bIn);
    })();
  }, [listId]);

  const notInList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const inSet = new Set(inList.map((b) => b.id));
    let base = allBooks.filter((b) => !inSet.has(b.id!));
    if (needle) {
      base = base.filter(
        (b) =>
          b.title.toLowerCase().includes(needle) ||
          (b.author || "").toLowerCase().includes(needle) ||
          String(b.year || "").includes(needle)
      );
    }
    return base.sort((a, b) => a.title.localeCompare(b.title, "sv"));
  }, [allBooks, inList, q]);

  async function handleAdd(b: Book) {
    setBusy(true);
    try {
      await linkBookToList(listId, b.id!);
      setInList(await getBooksInBookList(listId));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(b: Book) {
    setBusy(true);
    try {
      await unlinkBookFromList(listId, b.id!);
      setInList(await getBooksInBookList(listId));
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
      await renameBookList(list.id!, name.trim());
      setList(await getBookListById(listId));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!list) return;
    if (!confirm(`Ta bort listan "${list.name}"? (Böckerna ligger kvar)`)) return;
    setBusy(true);
    try {
      await deleteBookList(list.id!);
      nav("/book/collections");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/book/collections" className="chip">
            <ArrowLeft size={16} /> Tillbaka
          </Link>
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
          <Link to="/book/collections" className="chip">
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
          Böcker i listan{" "}
          <span className="text-sand-300 text-sm">({inList.length} st)</span>
        </h2>

        {inList.length === 0 ? (
          <p className="text-sand-300 text-sm">Inga böcker än. Lägg till från rutan nedan.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {inList
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title, "sv"))
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-2 border-b border-ink-700/30 pb-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.title}</div>
                    <div className="text-sand-300 text-xs">
                      {(b.author || "Okänd författare") +
                        (b.year ? ` • ${b.year}` : "") +
                        (b.format ? ` • ${labelBookFormat(b.format)}` : "")}
                    </div>
                  </div>
                  <button
                    className="chip"
                    onClick={() => handleRemove(b)}
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

      {/* Lägg till från befintliga böcker */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Lägg till bok</h2>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
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
            {allBooks.length === 0
              ? "Du har inga böcker i biblioteket ännu."
              : q
              ? "Inga träffar utanför listan."
              : "Alla böcker du har ligger redan i listan."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notInList.slice(0, 30).map((b) => (
              <button
                key={b.id}
                className="chip justify-between"
                onClick={() => handleAdd(b)}
                disabled={busy}
                title="Lägg till i listan"
              >
                <span className="truncate">
                  {b.title} {b.year ? `(${b.year})` : ""}
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

function labelBookFormat(f?: Book["format"]) {
  switch (f) {
    case "paperback":
      return "Pocket";
    case "hardcover":
      return "Inbunden";
    case "ebook":
      return "E-bok";
    case "audiobook":
      return "Ljudbok";
    case "other":
    default:
      return "Övrigt";
  }
}