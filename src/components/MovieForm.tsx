// src/components/MovieForm.tsx
import { useState } from "react";
import { db, Movie, Format } from "@/db";
import { useNavigate } from "react-router-dom";

type Props = { initial?: Movie };

const formats: { value: Format; label: string }[] = [
  { value: "uhd", label: "4K UHD" },
  { value: "bluray", label: "Blu-ray" },
  { value: "dvd", label: "DVD" },
  { value: "digital", label: "Digital" },
  { value: "vhs", label: "VHS" },
  { value: "other", label: "Övrigt" },
];

export default function MovieForm({ initial }: Props) {
  const nav = useNavigate();
  const [m, setM] = useState<Movie>(
    initial ?? {
      title: "",
      year: undefined,
      genres: [],
      posterUrl: "",
      createdAt: Date.now(),
      owned: true,
      wishlisted: false,
      digital: false,
      format: "other",
      location: "",
      provider: "",
      trailerUrl: "",
      seen: false,
      rating: undefined,
    }
  );

  function set<K extends keyof Movie>(key: K, val: Movie[K]) {
    setM((x) => ({ ...x, [key]: val }));
  }

  async function save() {
    if (!m.title.trim()) return alert("Titel krävs");
    const data: Movie = { ...m, createdAt: m.createdAt || Date.now() };
    if (initial?.id) await db.movies.update(initial.id, data);
    else await db.movies.add(data);
    nav("/");
  }

  return (
    <div className="card p-4 space-y-3">
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <input value={m.title} onChange={(e) => set("title", e.target.value)} type="text" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input value={m.year ?? ""} onChange={(e) => set("year", Number(e.target.value) || undefined)} type="number" />
        </div>
        <div>
          <label className="block text-sm mb-1">Betyg (1–10)</label>
          <input value={m.rating ?? ""} onChange={(e) => set("rating", Number(e.target.value) || undefined)} type="number" />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Genrer (kommaseparerade)</label>
        <input
          value={m.genres?.join(", ") ?? ""}
          onChange={(e) => set("genres", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          type="text"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Poster URL</label>
          <input value={m.posterUrl ?? ""} onChange={(e) => set("posterUrl", e.target.value)} type="url" />
        </div>
        <div>
          <label className="block text-sm mb-1">Trailer URL</label>
          <input value={m.trailerUrl ?? ""} onChange={(e) => set("trailerUrl", e.target.value)} type="url" />
        </div>
      </div>

      {/* Samlar-fält */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-3">
          <h3 className="font-semibold mb-2">Ägande</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!m.owned} onChange={(e) => set("owned", e.target.checked)} />
              Ägd
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!m.digital} onChange={(e) => set("digital", e.target.checked)} />
              Digital
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!m.wishlisted} onChange={(e) => set("wishlisted", e.target.checked)} />
              Önskelista
            </label>
          </div>

          <div className="mt-3">
            <label className="block text-sm mb-1">Format</label>
            <select value={m.format ?? "other"} onChange={(e) => set("format", e.target.value as any)}>
              {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Plats / Hylla</label>
              <input value={m.location ?? ""} onChange={(e) => set("location", e.target.value)} type="text" />
            </div>
            <div>
              <label className="block text-sm mb-1">Tjänst / Leverantör</label>
              <input value={m.provider ?? ""} onChange={(e) => set("provider", e.target.value)} type="text" />
            </div>
          </div>
        </div>

        <div className="card p-3">
          <h3 className="font-semibold mb-2">Status</h3>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!m.seen} onChange={(e) => set("seen", e.target.checked)} />
              Sett
            </label>
          </div>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button className="btn btn-primary" onClick={save}>
          Spara
        </button>
      </div>
    </div>
  );
}