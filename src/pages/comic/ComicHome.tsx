import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Comic } from "@/db";
import ComicCard from "@/components/ComicCard";
import ComicDetailsDialog from "@/components/ComicDetailsDialog";

export default function ComicHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Comic[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    owned: 0,
    digital: 0,
    wish: 0,
    lists: 0,
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Comic | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const anyDb = db as any;
        const listsCount = anyDb.comicLists?.count ? await anyDb.comicLists.count() : 0;

        const [total, owned, digital, wish, recentComics] = await Promise.all([
          db.comics.count(),
          db.comics.filter((c) => !!c.owned).count(),
          db.comics.filter((c) => !!c.digital).count(),
          db.comics.filter((c) => !!c.wishlisted).count(),
          db.comics.orderBy("createdAt").reverse().limit(12).toArray(),
        ]);

        if (!alive) return;
        setStats({ total, owned, digital, wish, lists: listsCount });
        setRecent(recentComics);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const showEmptyWelcome = !loading && stats.total === 0 && stats.lists === 0;

  return (
    <section className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">🗞️ Serier</h1>
        <p className="text-sand-300">Katalogisera seriealbum & tidningar — offline och snabbt.</p>
      </header>

      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Kom igång</h2>
            <p className="text-sand-300 text-sm">Lägg till en serie, sök i biblioteket eller bygg en lista.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/comic/add")}>Lägg till serie</button>
            <Link to="/comic/search" className="btn">Sök</Link>
            <Link to="/comic/collections" className="btn">Skapa lista</Link>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatCard label="Serier" value={stats.total} />
        <StatCard label="Ägda" value={stats.owned} />
        <StatCard label="Digitalt" value={stats.digital} />
        <StatCard label="Önskelista" value={stats.wish} />
        <StatCard label="Listor" value={stats.lists} />
      </section>

      {showEmptyWelcome && (
        <div className="card p-4">
          <h3 className="font-semibold mb-1">Din seriesamling väntar ✨</h3>
          <p className="text-sand-300 text-sm mb-3">Lägg till din första serie eller importera backup via Profil.</p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => navigate("/comic/add")}>Lägg till serie</button>
            <Link to="/profile" className="btn">Importera backup</Link>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Senast tillagda</h2>
          {recent.length > 0 && <Link to="/comic/search" className="text-sm hover:underline">Visa fler</Link>}
        </div>
        <div className="space-y-3">
          {recent.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => { setSelected(c); setOpen(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(c); setOpen(true);} }}
              className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-600 rounded-2xl"
            >
              <ComicCard comic={c} />
            </div>
          ))}
          {!loading && recent.length === 0 && (<div className="text-sand-300 text-sm">Inga serier ännu.</div>)}
        </div>
      </section>

      <ComicDetailsDialog open={open} comic={selected} onClose={() => setOpen(false)} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sand-300 text-xs">{label}</div>
    </div>
  );
}