// src/components/comic/ComicForm.tsx
import { useState } from "react";
import { db } from "@/db";
import type { Comic } from "@/types";
import { useNavigate } from "react-router-dom";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

interface ComicFormProps {
  initial?: Comic;
  submitLabel: string;
  onSubmit?: (data: Comic) => Promise<void>;
}

export default function ComicForm({ initial, submitLabel, onSubmit }: ComicFormProps) {
  const nav = useNavigate();
  const [scanOpen, setScanOpen] = useState(false);

  const [c, setC] = useState<Comic>(
    initial ?? ({
      title: "",
      seriesTitle: initial?.seriesTitle ?? initial?.series, // bakåtkomp
      volume: undefined,
      issueNumber: initial?.issueNumber ?? (initial as any)?.issue,
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
    } as Comic)
  );

  function set<K extends keyof Comic>(key: K, val: Comic[K]) {
    setC((x) => ({ ...x, [key]: val }));
  }

  async function save() {
    if (!c.title.trim()) return alert("Titel krävs");
    const data: Comic = {
      ...c,
      title: c.title.trim(),
      seriesTitle: c.seriesTitle?.trim() || undefined,
      createdAt: c.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (onSubmit) {
      await onSubmit(data);
    } else {
      if (initial?.id != null) {
        await db.comics.put({ ...data, id: initial.id });
      } else {
        await db.comics.add(data);
      }
      nav("/comic");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Basfält */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input value={c.title} onChange={(e) => set("title", e.target.value)} placeholder="Watchmen" />
        </div>
        <div>
          <label className="block text-sm mb-1">Serie</label>
          <input value={c.seriesTitle ?? ""} onChange={(e) => set("seriesTitle", e.target.value)} placeholder="—" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Volym</label>
          <input
            type="number"
            value={c.volume ?? ""}
            onChange={(e) => set("volume", Number(e.target.value) || undefined)}
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Nummer</label>
          <input
            type="number"
            value={c.issueNumber ?? ""}
            onChange={(e) => set("issueNumber", Number(e.target.value) || undefined)}
            placeholder="12"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            type="number"
            value={c.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
            placeholder="1986"
          />
        </div>
      </div>

      {/* Omslag */}
      <div>
        <label className="block text-sm mb-1">Omslagsbild (URL)</label>
        <input
          type="url"
          value={c.coverUrl ?? ""}
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
            value={c.barcode ?? ""}
            onChange={(e) => set("barcode", e.target.value)}
            placeholder="t.ex. 9781401207137"
            className="flex-1"
          />
          <button className="btn" onClick={() => setScanOpen(true)}>Skanna</button>
        </div>
        {scanOpen && (
          <BarcodeScannerDialog
            title="Skanna seriestreckkod"
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
            <input type="checkbox" checked={!!c.owned} onChange={(e) => set("owned", e.target.checked)} />
            Ägd
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!c.digital} onChange={(e) => set("digital", e.target.checked)} />
            Digital
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!c.wishlisted} onChange={(e) => set("wishlisted", e.target.checked)} />
            Önskelista
          </label>
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="block text-sm mb-1">Format</label>
        <select
          value={c.format ?? ""}
          onChange={(e) => set("format", (e.target.value || undefined) as Comic["format"])}
        >
          <option value="">(välj)</option>
          <option value="single-issue">Lösnummer</option>
          <option value="trade-paperback">TPB</option>
          <option value="hardcover">Inbunden</option>
          <option value="omnibus">Omnibus</option>
          <option value="magazine">Magasin</option>
          <option value="digital">Digital</option>
          <option value="other">Övrigt</option>
        </select>
      </div>

      {/* Anteckningar */}
      <div>
        <label className="block text-sm mb-1">Anteckningar</label>
        <textarea
          rows={4}
          value={c.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Upplaga, skick, var den finns …"
        />
      </div>

      <div className="pt-2">
        <button className="btn btn-primary" onClick={save}>{submitLabel}</button>
      </div>
    </div>
  );
}