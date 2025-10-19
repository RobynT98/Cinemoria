// src/components/game/GameForm.tsx
import { useMemo, useState } from "react";
import type { Game } from "@/db";

type Props = {
  initial?: Partial<Game>;
  submitLabel?: string;
  onSubmit: (data: Omit<Game, "id" | "createdAt">) => void | Promise<void>;
};

export default function GameForm({ initial, submitLabel = "Spara spel", onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState<number | "">(initial?.year ?? "");
  const [platform, setPlatform] = useState(initial?.platform ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [owned, setOwned] = useState<boolean>(!!initial?.owned);
  const [digital, setDigital] = useState<boolean>(!!initial?.digital);
  const [wishlisted, setWishlisted] = useState<boolean>(!!initial?.wishlisted);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const platforms = useMemo(
    () => [
      "PS5",
      "PS4",
      "Xbox Series",
      "Xbox One",
      "Switch",
      "PC",
      "Steam Deck",
      "Mobile",
      "Retro",
      "Övrigt",
    ],
    []
  );

  function validate(): string | null {
    if (!title.trim()) return "Titel krävs.";
    if (year !== "" && (year < 1970 || year > new Date().getFullYear() + 1)) {
      return "År ser orimligt ut.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        year: year === "" ? undefined : Number(year),
        platform: platform.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        owned,
        digital,
        wishlisted,
        notes: notes.trim() || undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="card p-4 space-y-4">
        <div>
          <label className="label">Titel</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Elden Ring"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">År</label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={year}
              onChange={(e) => {
                const v = e.target.value.trim();
                setYear(v === "" ? "" : Number(v));
              }}
              placeholder="2024"
            />
          </div>

          <div>
            <label className="label">Plattform</label>
            <input
              list="platforms"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="PS5, Switch, PC …"
            />
            <datalist id="platforms">
              {platforms.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="label">Omslagsbild (URL)</label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…/cover.jpg"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="label">Ägande</legend>
          <div className="flex flex-wrap gap-2">
            <label className="chip cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={owned}
                onChange={(e) => setOwned(e.target.checked)}
              />
              Ägd
            </label>
            <label className="chip cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={digital}
                onChange={(e) => setDigital(e.target.checked)}
              />
              Digital
            </label>
            <label className="chip cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={wishlisted}
                onChange={(e) => setWishlisted(e.target.checked)}
              />
              Önskelista
            </label>
          </div>
        </fieldset>

        <div>
          <label className="label">Anteckningar</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Edition, DLC-planer, var spelet ligger, osv."
          />
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={busy}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}