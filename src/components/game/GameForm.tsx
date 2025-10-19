// src/components/game/GameForm.tsx
import { useState } from "react";
import { db } from "@/db";
import type { Game } from "@/db";
import { useNavigate } from "react-router-dom";

type Props = {
  initial?: Game;
  submitLabel: string;
  onSubmit?: (g: Game) => Promise<void>;
};

export default function GameForm({ initial, submitLabel, onSubmit }: Props) {
  const nav = useNavigate();
  const [g, setG] = useState<Game>(
    initial ?? {
      title: "",
      year: undefined,
      platform: "",
      coverUrl: "",
      owned: true,
      digital: false,
      wishlisted: false,
      createdAt: Date.now(),
    }
  );

  function set<K extends keyof Game>(key: K, val: Game[K]) {
    setG((x) => ({ ...x, [key]: val }));
  }

  async function save() {
    if (!g.title.trim()) return alert("Titel krävs");
    const data: Game = { ...g, createdAt: g.createdAt || Date.now() };

    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Fallback om addGame inte finns ännu
      if (initial?.id) await db.games.update(initial.id, data);
      else await db.games.add(data);
      nav("/game");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <input
          type="text"
          value={g.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            type="number"
            value={g.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Plattform</label>
          <input
            type="text"
            placeholder="PS5, Switch, PC …"
            value={g.platform ?? ""}
            onChange={(e) => set("platform", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Omslagsbild (URL)</label>
        <input
          type="url"
          value={g.coverUrl ?? ""}
          onChange={(e) => set("coverUrl", e.target.value)}
        />
      </div>

      <div className="card p-3">
        <h3 className="font-semibold mb-2">Ägande</h3>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!g.owned}
              onChange={(e) => set("owned", e.target.checked)}
            />
            Ägd
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!g.digital}
              onChange={(e) => set("digital", e.target.checked)}
            />
            Digital
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!g.wishlisted}
              onChange={(e) => set("wishlisted", e.target.checked)}
            />
            Önskelista
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button className="btn btn-primary" onClick={save}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}