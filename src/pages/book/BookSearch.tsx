// src/pages/book/BookSearch.tsx
import { useEffect, useMemo, useState } from "react";
import { searchBooks, Book } from "@/db";
import BookCard from "@/components/BookCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

type Filters = {
  text?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  format?: "hardcover" | "paperback" | "ebook" | "audiobook" | "other";
  language?: string;
};

export default function BookSearch() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [openFilters, setOpenFilters] = useState(false);
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const activeCount = useMemo(
    () =>
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "" && v !== false).length,
    [filters]
  );

  async function runSearch() {
    setLoading(true);
    try {
      const r = await searchBooks({
        text: q,
        owned: filters.owned,
        digital: filters.digital,
        wishlisted: filters.wishlisted,
        format: filters.format,
        language: filters.language?.trim().toLowerCase(),
      });
      setResults(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(); // första gång, tom sökning ger alla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFilters() {
    setFilters({});
    setTimeout(runSearch, 0);
  }

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Sök böcker</h1>

      <div className="card p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              className="pl-9"
              type="text"
              placeholder="Sök titel, författare, genre, ISBN…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
          </div>

          <button className="chip" onClick={() => setOpenFilters((v) => !v)}>
            <SlidersHorizontal size={14} />
            Filter {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
          <button className="chip" onClick={clearFilters} title="Rensa">
            <X size={14} /> Rensa
          </button>
          <button className="btn btn-primary" onClick={runSearch}>
            Sök
          </button>
        </div>

        {openFilters && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!filters.owned}
                onChange={(e) => setFilters((f) => ({ ...f, owned: e.target.checked || undefined }))}
              />
              Ägd
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!filters.digital}
                onChange={(e) => setFilters((f) => ({ ...f, digital: e.target.checked || undefined }))}
              />
              Digital
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!filters.wishlisted}
                onChange={(e) => setFilters((f) => ({ ...f, wishlisted: e.target.checked || undefined }))}
              />
              Önskelista
            </label>

            <div>
              <label className="block text-sm mb-1">Format</label>
              <select
                value={filters.format ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, format: (e.target.value || undefined) as any }))
                }
              >
                <option value="">Alla</option>
                <option value="hardcover">Inbunden</option>
                <option value="paperback">Pocket</option>
                <option value="ebook">E-bok</option>
                <option value="audiobook">Ljudbok</option>
                <option value="other">Övrigt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Språk</label>
              <input
                placeholder="sv / en / de …"
                value={filters.language ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, language: e.target.value || undefined }))
                }
                type="text"
              />
            </div>
          </div>
        )}
      </div>

      {/* Resultat */}
      <div className="space-y-3">
        {loading && <div className="card p-4">Söker…</div>}
        {!loading && results.length === 0 && (
          <div className="card p-4">Inga träffar.</div>
        )}
        {!loading &&
          results.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </section>
  );
}