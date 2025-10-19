import { useEffect, useMemo, useState } from "react";
import { db, type Book } from "@/db";
import BookCard from "@/components/BookCard";

type Filter = "all" | "owned" | "digital" | "wish";

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const bs = await db.books.orderBy("title").toArray();
      if (mounted) setBooks(bs);
    })();
    return () => {
      mounted = false;
    };
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
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [books, query, filter]);

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>

      <div className="flex gap-2 flex-wrap mb-3">
        <input
          className="flex-1 min-w-[220px]"
          placeholder="Sök titel, författare, ISBN…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">Alla</option>
          <option value="owned">Ägd</option>
          <option value="digital">Digital</option>
          <option value="wish">Önskelista</option>
        </select>
      </div>

      <div className="space-y-3">
        {shown.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
        {shown.length === 0 && (
          <div className="text-sand-300 text-sm">Inga träffar.</div>
        )}
      </div>
    </section>
  );
}