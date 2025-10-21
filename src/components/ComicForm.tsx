import { useState } from "react";
import type { Comic } from "@/types";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

type Props = {
  initial?: Partial<Comic>;
  onSubmit: (data: Omit<Comic, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
  busy?: boolean;
  submitLabel?: string;
};

export default function ComicForm({ initial, onSubmit, busy, submitLabel = "Spara" }: Props) {
  const init = initial ?? {};

  // Bakåtkomp: stöd både seriesTitle/issueNumber och äldre series/issue
  const initialSeriesTitle = (init as any).seriesTitle ?? (init as any).series ?? "";
  const initialIssueNumber = (init as any).issueNumber ?? (init as any).issue ?? "";

  const [title, setTitle] = useState(init.title ?? "");
  const [seriesTitle, setSeriesTitle] = useState(initialSeriesTitle as string);
  const [volume, setVolume] = useState<number | "">(init.volume ?? "");
  const [issueNumber, setIssueNumber] = useState<number | "">(initialIssueNumber || "");
  const [year, setYear] = useState<number | "">(init.year ?? "");
  const [owned, setOwned] = useState(!!init.owned);
  const [digital, setDigital] = useState(!!init.digital);
  const [wishlisted, setWishlisted] = useState(!!init.wishlisted);
  const [format, setFormat] = useState<Comic["format"] | undefined>(init.format);
  const [coverUrl, setCoverUrl] = useState(init.coverUrl ?? "");
  const [barcode, setBarcode] = useState(init.barcode ?? "");
  const [notes, setNotes] = useState(init.notes ?? "");
  const [scanOpen, setScanOpen] = useState(false);

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
    } as any);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">Titel *</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Serie</span>
          <input value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm">Volym</span>
          <input
            inputMode="numeric"
            value={volume}
            onChange={(e) => setVolume(e.target.value ? Number(e.target.value) : "")}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Nummer</span>
          <input
            inputMode="numeric"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value ? Number(e.target.value) : "")}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">År</span>
          <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}/>
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">Omslagsbild (URL)</span>
        <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
      </label>

      <div>
        <span className="text-sm block mb-1">Streckkod (EAN/UPC)</span>
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
            subtitle="Rikta mot EAN/UPC"
            onDetected={(code) => {
              setBarcode(code);
              setScanOpen(false);
            }}
            onClose={() => setScanOpen(false)}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="chip cursor-pointer">
          <input className="mr-2" type="checkbox" checked={owned} onChange={(e) => setOwned(e.target.checked)} />
          Ägd
        </label>
        <label className="chip cursor-pointer">
          <input className="mr-2" type="checkbox" checked={digital} onChange={(e) => setDigital(e.target.checked)} />
          Digital
        </label>
        <label className="chip cursor-pointer">
          <input className="mr-2" type="checkbox" checked={wishlisted} onChange={(e) => setWishlisted(e.target.checked)} />
          Önskelista
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">Format</span>
        <select value={format ?? ""} onChange={(e) => setFormat((e.target.value || undefined) as any)}>
          <option value="">(välj)</option>
          <option value="single-issue">Lösnummer</option>
          <option value="trade-paperback">TPB</option>
          <option value="hardcover">Inbunden</option>
          <option value="omnibus">Omnibus</option>
          <option value="magazine">Magasin</option>
          <option value="digital">Digital</option>
          <option value="other">Övrigt</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-sm">Anteckningar</span>
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div className="pt-2">
        <button className="btn btn-primary" disabled={busy} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}