import { useState } from "react";
import type { Album } from "@/types";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

type Props = {
  initial?: Partial<Album>;
  onSubmit: (data: Omit<Album, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
  busy?: boolean;
  submitLabel?: string;
};

export default function AlbumForm({ initial, onSubmit, busy, submitLabel = "Spara" }: Props) {
  const [scanOpen, setScanOpen] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const [year, setYear] = useState<number | "">(initial?.year ?? "");
  const [genres, setGenres] = useState(
    Array.isArray(initial?.genres) ? initial!.genres!.join(", ") : (initial?.genres as any) ?? ""
  );
  const [owned, setOwned] = useState(!!initial?.owned);
  const [digital, setDigital] = useState(!!initial?.digital);
  const [wishlisted, setWishlisted] = useState(!!initial?.wishlisted);
  const [format, setFormat] = useState<Album["format"] | undefined>(initial?.format);
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      artist: artist.trim() || undefined,
      year: typeof year === "number" ? year : undefined,
      genres: genres
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      owned,
      digital,
      wishlisted,
      format,
      coverUrl: coverUrl || undefined,
      barcode: barcode || undefined,
      notes: notes || undefined,
      // resten (createdAt/updatedAt) sätts högre upp i flödet
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
          <span className="text-sm">Artist</span>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">År</span>
          <input
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Genrer (kommaseparerat)</span>
          <input value={genres} onChange={(e) => setGenres(e.target.value)} />
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
            placeholder="t.ex. 0886971234567"
          />
          <button type="button" className="btn" onClick={() => setScanOpen(true)}>
            Skanna
          </button>
        </div>
        {scanOpen && (
          <BarcodeScannerDialog
            title="Skanna albumstreckkod"
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
          <input
            className="mr-2"
            type="checkbox"
            checked={wishlisted}
            onChange={(e) => setWishlisted(e.target.checked)}
          />
          Önskelista
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">Format</span>
        <select value={format ?? ""} onChange={(e) => setFormat((e.target.value || undefined) as any)}>
          <option value="">(välj)</option>
          <option value="cd">CD</option>
          <option value="vinyl">Vinyl</option>
          <option value="cassette">Kassett</option>
          <option value="digital">Digital</option>
          <option value="sacd">SACD</option>
          <option value="bluray-audio">Blu-ray Audio</option>
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