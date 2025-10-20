import { useState } from "react";
import { db, type Game } from "@/db";
import { useNavigate } from "react-router-dom";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

interface GameFormProps {
  initial?: Game;
  submitLabel: string;
  onSubmit?: (data: Game) => Promise<void>;
}

export default function GameForm({ initial, submitLabel, onSubmit }: GameFormProps) {
  const nav = useNavigate();
  const [scanOpen, setScanOpen] = useState(false);

  const [g, setG] = useState<Game>(
    initial ?? {
      title: "",
      year: undefined,
      platform: "",
      coverUrl: "",
      // nyckeln här: lokalt sparad streckkod (ingen nät-hämtning)
      barcode: "",
      owned: false,
      digital: false,
      wishlisted: false,
      notes: "",
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
      if (initial?.id != null) {
        await db.games.put({ ...data, id: initial.id });
      } else {
        await db.games.add(data);
      }
      nav("/game");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Titel */}
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <input
          type="text"
          value={g.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Elden Ring"
        />
      </div>

      {/* År + Plattform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            type="number"
            value={g.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
            placeholder="2024"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Plattform</label>
          <input
            type="text"
            value={g.platform ?? ""}
            onChange={(e) => set("platform", e.target.value)}
            placeholder="PS5, Switch, PC …"
          />
        </div>
      </div>

      {/* Omslag */}
      <div>
        <label className="block text-sm mb-1">Omslagsbild (URL)</label>
        <input
          type="url"
          value={g.coverUrl ?? ""}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="https://…/cover.jpg"
        />
      </div>

      {/* Streckkod (lokal, offline) */}
      <div>
        <label className="block text-sm mb-1">Streckkod (EAN/UPC)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={g.barcode ?? ""}
            onChange={(e) => set("barcode", e.target.value)}
            placeholder="t.ex. 8717418395693"
            className="flex-1"
          />
          <button className="btn" onClick={() => setScanOpen(true)}>
            Skanna
          </button>
        </div>
        {scanOpen && (
          <BarcodeScannerDialog
            title="Skanna spelstreckkod"
            subtitle="Kameran startar – rikta mot EAN/UPC"
            onDetected={(code) => {
              set("barcode", code);
              setScanOpen(false);
            }}
            onClose={() => setScanOpen(false)}
          />
        )}
      </div>

      {/* Ägande */}
      <div className="card p-3">
        <h3 className="font-semibold mb-2">Ägande</h3>
        <div className="flex items-center gap-4 flex-wrap">
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

      {/* Anteckningar */}
      <div>
        <label className="block text-sm mb-1">Anteckningar</label>
        <textarea
          rows={4}
          value={g.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Edition, DLC-planer, var spelet ligger, osv."
        />
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button className="btn btn-primary" onClick={save}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}