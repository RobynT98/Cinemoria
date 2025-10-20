import { useEffect, useMemo, useState } from "react";
import { db, type Book } from "@/db";
import BookCard from "@/components/BookCard";
import BookDetailsDialog from "@/components/BookDetailsDialog";

type Filter = "all" | "owned" | "digital" | "wish";

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Book | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const bs = await db.books.orderBy("title").toArray();
        if (alive) setBooks(bs);
      } catch (e: any) {
        console.error("BookSearch load error:", e);
        if (alive) setErrMsg(e?.message || "Kunde inte läsa databasen.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      if (filter === "owned" && !b.owned) return false;
      if (filter === "digital" && !b.digital) return false;
      if (filter === "wish" && !b.wishlisted) return false;

      if (!q) return true;

      const hay = [
        b.title,
        b.author || "",
        (b.genres || []).join(" "),
        b.language || "",
        b.format || "",
        b.isbn || "",
        b.publisher || "",
        String(b.year || ""),
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });
  }, [books, query, filter]);

  return (
    <section className="p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Sök titel, författare, ISBN…"
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
        {shown.map((b) => (
          <div
            key={b.id ?? b.title}
            role="button"
            tabIndex={0}
            onClick={() => { setSelected(b); setOpen(true); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(b); setOpen(true);} }}
            className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-600 rounded-2xl"
          >
            <BookCard book={b} />
          </div>
        ))}

        {!loading && shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inga träffar.</div>
        )}
      </div>

      {open && selected && (
        <BookDetailsDialog open={open} book={selected} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}