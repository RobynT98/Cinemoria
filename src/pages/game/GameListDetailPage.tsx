import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, type Game, type GameList as DbList } from "@/db";
import { Plus, Trash2, Edit3, ArrowLeft, X, Search } from "lucide-react";

export default function GameListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = Number(params.id);
  const nav = useNavigate();

  const [list, setList] = useState<DbList | undefined>();
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [inList, setInList] = useState<Game[]>([]);
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
      const [l, games] = await Promise.all([db.gameLists.get(listId), db.games.toArray()]);
      if (!l) {
        setNotFound(true);
        return;
      }
      setList(l);
      setAllGames(games);

      // Bygg inList via länktabellen "gameList"
      const links = await db.gameList.where("listId").equals(listId).toArray();
      const ids = new Set<number>(links.map((ln: any) => Number(ln.gameId)));
      const inside = games.filter((g) => typeof g.id === "number" && ids.has(Number(g.id)));
      setInList(inside);
    } catch (err) {
      console.error("Game list reload failed:", err);
      alert("Kunde inte läsa spellistan. Prova att ladda om sidan.");
    }
  }

  const notInList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const inSet = new Set(inList.map((g) => g.id));
    let base = allGames.filter((g) => !inSet.has(g.id!));
    if (needle) {
      base = base.filter(
        (g) =>
          g.title.toLowerCase().includes(needle) ||
          (g.platform || "").toLowerCase().includes(needle) ||
          String(g.year || "").includes(needle)
      );
    }
    return base.sort((a, b) => a.title.localeCompare(b.title, "sv"));
  }, [allGames, inList, q]);

  async function handleAdd(g: Game) {
    if (!g.id) return;
    setBusy(true);
    try {
      const exists = await db.gameList.where({ listId, gameId: g.id }).first();
      if (!exists) {
        await db.gameList.add({ listId, gameId: g.id, createdAt: Date.now() } as any);
      }
      await reload();
    } catch (err) {
      console.error("Add game to list failed:", err);
      alert("Kunde inte lägga till spelet i listan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(g: Game) {
    if (!g.id) return;
    setBusy(true);
    try {
      const link = await db.gameList.where({ listId, gameId: g.id }).first();
      if ((link as any)?.id) await db.gameList.delete((link as any).id);
      await reload();
    } catch (err) {
      console.error("Remove game from list failed:", err);
      alert("Kunde inte ta bort spelet från listan.");
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
      await db.gameLists.update(list.id!, { name: name.trim(), updatedAt: Date.now() });
      setList(await db.gameLists.get(listId));
    } catch (err) {
      console.error("Rename game list failed:", err);
      alert("Kunde inte byta namn på listan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!list) return;
    if (!confirm(`Ta bort listan "${list.name}"? (Spelen ligger kvar)`)) return;
    setBusy(true);
    try {
      const links = await db.gameList.where("listId").equals(listId).toArray();
      await db.transaction("rw", [db.gameList, db.gameLists], async () => {
        for (const ln of links) if ((ln as any).id) await db.gameList.delete((ln as any).id);
        await db.gameLists.delete(list.id!);
      });
      nav("/game/collections");
    } catch (err) {
      console.error("Delete game list failed:", err);
      alert("Kunde inte ta bort listan.");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/game/collections" className="chip">
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
          <Link to="/game/collections" className="chip">
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
          Spel i listan{" "}
          <span className="text-sand-300 text-sm">({inList.length} st)</span>
        </h2>

        {inList.length === 0 ? (
          <p className="text-sand-300 text-sm">Inga spel än. Lägg till från rutan nedan.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {inList
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title, "sv"))
              .map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 border-b border-ink-700/30 pb-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{g.title}</div>
                    <div className="text-sand-300 text-xs">
                      {(g.platform || "Okänd plattform") + (g.year ? ` • ${g.year}` : "")}
                    </div>
                  </div>
                  <button
                    className="chip"
                    onClick={() => handleRemove(g)}
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

      {/* Lägg till från befintliga spel */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Lägg till spel</h2>

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
            {allGames.length === 0
              ? "Du har inga spel i biblioteket ännu."
              : q
              ? "Inga träffar utanför listan."
              : "Alla spel du har ligger redan i listan."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notInList.slice(0, 30).map((g) => (
              <button
                key={g.id}
                className="chip justify-between"
                onClick={() => handleAdd(g)}
                disabled={busy}
                title="Lägg till i listan"
              >
                <span className="truncate">
                  {g.title} {g.year ? `(${g.year})` : ""}
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