import { useState } from "react";
import type { Comic } from "@/types";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

type Props = {
  initial?: Partial<Comic>;
  onSubmit: (data: Omit<Comic, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
  busy?: boolean;
  submitLabel?: string;
};

export default function ComicForm({ initial, onSubmit, busy, submitLabel = "Spara serie" }: Props) {
  const init = initial ?? {};

  // Bakåtkomp (series/issue)
  const initialSeriesTitle = (init as any).seriesTitle ?? (init as any).series ?? "";
  const initialIssueNumber = (init as any).issueNumber ?? (init as any).issue ?? "";

  const [title, setTitle] = useState<string>(init.title ?? "");
  const [seriesTitle, setSeriesTitle] = useState<string>(initialSeriesTitle as string);
  const [volume, setVolume] = useState<number | "">(init.volume ?? "");
  const [issueNumber, setIssueNumber] = useState<number | "">(initialIssueNumber || "");
  const [year, setYear] = useState<number | "">(init.year ?? "");
  const [owned, setOwned] = useState<boolean>(!!init.owned);
  const [digital, setDigital] = useState<boolean>(!!init.digital);
  const [wishlisted, setWishlisted] = useState<boolean>(!!init.wishlisted);
  const [format, setFormat] = useState<Comic["format"] | undefined>(init.format);
  const [coverUrl, setCoverUrl] = useState<string>(init.coverUrl ?? "");
  const [barcode, setBarcode] = useState<string>(init.barcode ?? "");
  const [notes, setNotes] = useState<string>(init.notes ?? "");
  const [scanOpen, setScanOpen] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      seriesTitle: seriesTitle.trim() || undefined,
      volume: typeof volume === "number" ? volume : undefined,
      issueNumber: typeof issueNumber === "number" ? issueNumber : undefined,
      year: typeof year === "number" ? year : undefined,
      owned,
      digital,
      wishlisted,
      format,
      coverUrl: coverUrl || undefined,
      barcode: barcode || undefined,
      notes: notes || undefined,
    } as Omit<Comic, "id" | "createdAt" | "updatedAt">);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card p-4 space-y-3">
        {/* Titel + Serie */}
        <div>
          <label className="block text-sm mb-1">Titel *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Batman: Year One" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Serie</label>
            <input value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} placeholder="Batman" />
          </div>
          <div>
            <label className="block text-sm mb-1">Volym</label>
            <input
              type="number"
              value={volume ?? ""}
              onChange={(e) => setVolume(e.target.value ? Number(e.target.value) : "")}
              placeholder="1"
            />
          </div>
        </div>

        {/* Nummer + År */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Nummer</label>
            <input
              type="number"
              value={issueNumber ?? ""}
              onChange={(e) => setIssueNumber(e.target.value ? Number(e.target.value) : "")}
              placeholder="404"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">År</label>
            <input
              type="number"
              value={year ?? ""}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
              placeholder="1987"
            />
          </div>
        </div>

        {/* Omslag */}
        <div>
          <label className="block text-sm mb-1">Omslagsbild (URL)</label>
          <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…/cover.jpg" />
        </div>

        {/* Streckkod */}
        <div>
          <label className="block text-sm mb-1">Streckkod (EAN/UPC)</label>
          <div className="flex items-center gap-2">
            <input
              className="flex-1"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="t.ex. 9781401207137"
            />
            <button type="button" className="btn" onClick={() => setScanOpen(true)}>
              Skanna
            </button>
          </div>
          {scanOpen && (
            <BarcodeScannerDialog
              title="Skanna seriestreckkod"
              subtitle="Kameran startar – rikta mot EAN/UPC"
              onDetected={(code) => {
                setBarcode(code);
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
              <input type="checkbox" checked={owned} onChange={(e) => setOwned(e.target.checked)} />
              Ägd
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={digital} onChange={(e) => setDigital(e.target.checked)} />
              Digital
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={wishlisted} onChange={(e) => setWishlisted(e.target.checked)} />
              Önskelista
            </label>
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm mb-1">Format</label>
          <select value={format ?? ""} onChange={(e) => setFormat((e.target.value || undefined) as Comic["format"])}>
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
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Utgåva, variant, skick …" />
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button className="btn btn-primary" disabled={busy} type="submit">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}