import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, type Book, type BookList as DbList } from "@/db";
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
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  async function reload() {
    try {
      const [l, books] = await Promise.all([
        db.bookLists.get(listId),
        db.books.toArray(),
      ]);
      if (!l) {
        setNotFound(true);
        return;
      }
      setList(l);
      setAllBooks(books);

      // Läs länkar och bygg inList
      const links = await db.bookLinks.where("listId").equals(listId).toArray();
      const ids = new Set<number>(links.map((ln: any) => Number(ln.bookId)));
      const inside = books.filter((b) => typeof b.id === "number" && ids.has(Number(b.id)));
      setInList(inside);
    } catch (err) {
      console.error("Book list reload failed:", err);
      alert("Kunde inte läsa boklistan. Prova att ladda om sidan.");
    }
  }

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
    if (!b.id) return;
    setBusy(true);
    try {
      const exists = await db.bookLinks.where({ listId, bookId: b.id }).first();
      if (!exists) {
        await db.bookLinks.add({ listId, bookId: b.id, createdAt: Date.now() } as any);
      }
      await reload();
    } catch (err) {
      console.error("Add book to list failed:", err);
      alert("Kunde inte lägga till boken i listan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(b: Book) {
    if (!b.id) return;
    setBusy(true);
    try {
      const link = await db.bookLinks.where({ listId, bookId: b.id }).first();
      if (link?.id) await db.bookLinks.delete(link.id);
      await reload();
    } catch (err) {
      console.error("Remove book from list failed:", err);
      alert("Kunde inte ta bort boken från listan.");
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
      await db.bookLists.update(list.id!, { name: name.trim(), updatedAt: Date.now() });
      setList(await db.bookLists.get(listId));
    } catch (err) {
      console.error("Rename book list failed:", err);
      alert("Kunde inte byta namn på listan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!list) return;
    if (!confirm(`Ta bort listan "${list.name}"? (Böckerna ligger kvar)`)) return;
    setBusy(true);
    try {
      const links = await db.bookLinks.where("listId").equals(listId).toArray();
      await db.transaction("rw", [db.bookLinks, db.bookLists], async () => {
        for (const ln of links) if (ln.id) await db.bookLinks.delete(ln.id);
        await db.bookLists.delete(list.id!);
      });
      nav("/book/collections");
    } catch (err) {
      console.error("Delete book list failed:", err);
      alert("Kunde inte ta bort listan.");
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
    default:
      return "Övrigt";
  }
}