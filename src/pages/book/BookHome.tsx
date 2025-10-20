import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Book } from "@/db";
import BookCard from "@/components/BookCard";
import BookDetailsDialog from "@/components/BookDetailsDialog";

export default function BookHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Book[]>([]);
  const [stats, setStats] = useState({ total: 0, owned: 0, digital: 0, wish: 0 });

  // Detalj-dialog
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Book | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [total, owned, digital, wish, rec] = await Promise.all([
          db.books.count(),
          db.books.filter((b) => !!b.owned).count(),
          db.books.filter((b) => !!b.digital).count(),
          db.books.filter((b) => !!b.wishlisted).count(),
          db.books.orderBy("createdAt").reverse().limit(12).toArray(),
        ]);
        if (!alive) return;
        setStats({ total, owned, digital, wish });
        setRecent(rec);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const showEmpty = !loading && stats.total === 0;

  return (
    <section className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">📚 Böcker</h1>
        <p className="text-sand-300">Katalogisera ägda böcker, e-böcker och önskelista — offline.</p>
      </header>

      {/* Snabbstart */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">Lägg till en bok eller sök i din hylla.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/book/add")}>Lägg till bok</button>
            <Link to="/book/search" className="btn">Sök</Link>
          </div>
        </div>
      </div>

      {/* Nyckeltal */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Böcker" value={stats.total} />
        <Stat label="Ägda" value={stats.owned} />
        <Stat label="Digitalt" value={stats.digital} />
        <Stat label="Önskelista" value={stats.wish} />
      </section>

      {/* Tomt läge */}
      {showEmpty && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Bokhyllan väntar ✨</h3>
          <p className="text-sand-300 text-sm mb-3">Lägg till din första bok eller importera en JSON-backup via Profil.</p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/book/add")}>Lägg till bok</button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      {/* Senast tillagda */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Senast tillagda</h2>
          {recent.length > 0 && <Link to="/book/search" className="text-sm hover:underline">Visa fler</Link>}
        </div>
        <div className="space-y-3">
          {recent.map((b) => (
            <div
              key={b.id}
              role="button"
              className="cursor-pointer"
              onClick={() => { setSelected(b); setOpen(true); }}
            >
              <BookCard book={b} />
            </div>
          ))}
          {!loading && recent.length === 0 && (
            <div className="text-sand-300 text-sm">Inga böcker ännu.</div>
          )}
        </div>
      </section>

      <BookDetailsDialog open={open} book={selected} onClose={() => setOpen(false)} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sand-300 text-xs">{label}</div>
    </div>
  );
}