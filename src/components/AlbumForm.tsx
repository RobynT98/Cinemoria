// src/components/album/AlbumForm.tsx
import { useState } from "react";
import { db } from "@/db";
import type { Album } from "@/types";
import { useNavigate } from "react-router-dom";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

interface AlbumFormProps {
  initial?: Album;
  submitLabel: string;
  onSubmit?: (data: Album) => Promise<void>;
}

export default function AlbumForm({ initial, submitLabel, onSubmit }: AlbumFormProps) {
  const nav = useNavigate();
  const [scanOpen, setScanOpen] = useState(false);

  const [a, setA] = useState<Album>(
    initial ?? ({
      title: "",
      artist: "",
      year: undefined,
      genres: [],
      coverUrl: "",
      barcode: "",
      owned: false,
      digital: false,
      wishlisted: false,
      format: undefined,
      notes: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Album)
  );

  function set<K extends keyof Album>(key: K, val: Album[K]) {
    setA((x) => ({ ...x, [key]: val }));
  }

  async function save() {
    if (!a.title.trim()) return alert("Titel krävs");
    const data: Album = {
      ...a,
      title: a.title.trim(),
      artist: a.artist?.trim() || undefined,
      genres: Array.isArray(a.genres)
        ? a.genres
        : (a.genres as any)
            ?.toString()
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      createdAt: a.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (onSubmit) {
      await onSubmit(data);
    } else {
      if (initial?.id != null) {
        await db.albums.put({ ...data, id: initial.id });
      } else {
        await db.albums.add(data);
      }
      nav("/music");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Titel + Artist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input value={a.title} onChange={(e) => set("title", e.target.value)} placeholder="Kind of Blue" />
        </div>
        <div>
          <label className="block text-sm mb-1">Artist</label>
          <input value={a.artist ?? ""} onChange={(e) => set("artist", e.target.value)} placeholder="Miles Davis" />
        </div>
      </div>

      {/* År + Genrer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            type="number"
            value={a.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
            placeholder="1959"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Genrer (kommaseparerat)</label>
          <input
            value={Array.isArray(a.genres) ? a.genres.join(", ") : (a.genres as any) ?? ""}
            onChange={(e) =>
              set(
                "genres",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Jazz, Modal …"
          />
        </div>
      </div>

      {/* Omslag */}
      <div>
        <label className="block text-sm mb-1">Omslagsbild (URL)</label>
        <input
          type="url"
          value={a.coverUrl ?? ""}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="https://…/cover.jpg"
        />
      </div>

      {/* Streckkod */}
      <div>
        <label className="block text-sm mb-1">Streckkod (EAN/UPC)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={a.barcode ?? ""}
            onChange={(e) => set("barcode", e.target.value)}
            placeholder="t.ex. 0886971234567"
            className="flex-1"
          />
          <button className="btn" onClick={() => setScanOpen(true)}>Skanna</button>
        </div>
        {scanOpen && (
          <BarcodeScannerDialog
            title="Skanna albumstreckkod"
            subtitle="Rikta mot EAN/UPC"
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
            <input type="checkbox" checked={!!a.owned} onChange={(e) => set("owned", e.target.checked)} />
            Ägd
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!a.digital} onChange={(e) => set("digital", e.target.checked)} />
            Digital
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!a.wishlisted} onChange={(e) => set("wishlisted", e.target.checked)} />
            Önskelista
          </label>
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="block text-sm mb-1">Format</label>
        <select
          value={a.format ?? ""}
          onChange={(e) => set("format", (e.target.value || undefined) as Album["format"])}
        >
          <option value="">(välj)</option>
          <option value="cd">CD</option>
          <option value="vinyl">Vinyl</option>
          <option value="cassette">Kassett</option>
          <option value="digital">Digital</option>
          <option value="sacd">SACD</option>
          <option value="bluray-audio">Blu-ray Audio</option>
          <option value="other">Övrigt</option>
        </select>
      </div>

      {/* Anteckningar */}
      <div>
        <label className="block text-sm mb-1">Anteckningar</label>
        <textarea
          rows={4}
          value={a.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Press, utgåva, skick …"
        />
      </div>

      <div className="pt-2">
        <button className="btn btn-primary" onClick={save}>{submitLabel}</button>
      </div>
    </div>
  );
}