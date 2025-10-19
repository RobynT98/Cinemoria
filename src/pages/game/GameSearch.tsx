// src/pages/game/GameSearch.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Game } from "@/db";
import { searchGames } from "@/db";
import { Search, Filter, XCircle } from "lucide-react";

type Filters = {
  text?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  platform?: string; // fri text tills vi har enum
};

export default function GameSearch() {
  const [q, setQ] = useState("");
  const [owned, setOwned] = useState<boolean | undefined>(undefined);
  const [digital, setDigital] = useState<boolean | undefined>(undefined);
  const [wishlisted, setWishlisted] = useState<boolean | undefined>(undefined);
  const [platform, setPlatform] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: Filters = useMemo(
    () => ({
      text: q,
      owned,
      digital,
      wishlisted,
      platform: platform.trim() || undefined,
    }),
    [q, owned, digital, wishlisted, platform]
  );

  async function runSearch() {
    setLoading(true);
    try {
      const res = await searchGames(filters);
      setResults(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // första laddning – ingen text/filtrering
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // kör sökning när användaren ändrar något (debounce-light)
  useEffect(() => {
    const t = setTimeout(runSearch, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const hasAnyFilter =
    q.trim() ||
    owned !== undefined ||
    digital !== undefined ||
    wishlisted !== undefined ||
    platform.trim();

  function clearAll() {
    setQ("");
    setOwned(undefined);
    setDigital(undefined);
    setWishlisted(undefined);
    setPlatform("");
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sök spel</h1>
        {hasAnyFilter && (
          <button className="chip" onClick={clearAll} title="Rensa filter">
            <XCircle size={14} />
            Rensa
          </button>
        )}
      </header>

      {/* Sök + filter */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
          />
          <input
            className="pl-9"
            type="text"
            placeholder="Titel, serie, utgivare…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Plattform</label>
            <input
              type="text"
              placeholder="PS5, Switch, PC …"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 flex items-center gap-2">
              <Filter size={14} /> Snabbfilter
            </label>
            <div className="flex flex-wrap gap-2">
              <Toggle
                label="Ägd"
                value={owned}
                onChange={(v) => setOwned(v)}
              />
              <Toggle
                label="Digital"
                value={digital}
                onChange={(v) => setDigital(v)}
              />
              <Toggle
                label="Önskelista"
                value={wishlisted}
                onChange={(v) => setWishlisted(v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <section>
        {loading ? (
          <div className="card p-4">Söker…</div>
        ) : results.length === 0 ? (
          <div className="card p-4">
            {hasAnyFilter ? "Inga träffar på din sökning." : "Inga spel ännu."}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {results.map((g) => (
              <li
                key={g.id}
                className="card p-3 hover:shadow-card transition"
              >
                <Link to={`/game/edit/${g.id}`} className="flex gap-3">
                  {g.coverUrl ? (
                    <img
                      src={g.coverUrl}
                      alt={g.title}
                      className="w-14 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded bg-sand-200 dark:bg-ink-700 grid place-items-center">
                      🎮
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{g.title}</div>
                    <div className="text-xs text-sand-300">
                      {[
                        g.platform,
                        g.year ? `(${g.year})` : null,
                        g.owned ? "Ägd" : null,
                        g.digital ? "Digital" : null,
                        g.wishlisted ? "Önskelista" : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  // cykla: undefined -> true -> false -> undefined
  function next() {
    if (value === undefined) onChange(true);
    else if (value === true) onChange(false);
    else onChange(undefined);
  }
  const text =
    value === undefined ? label : value ? `${label}: Ja` : `${label}: Nej`;
  const active =
    value !== undefined ? "bg-accent-500 text-white" : "";

  return (
    <button className={`chip ${active}`} onClick={next}>
      {text}
    </button>
  );
}