import { useState } from "react";
import type { Album } from "@/types";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

type Props = {
  initial?: Partial<Album>;
  onSubmit: (data: Omit<Album, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
  busy?: boolean;
  submitLabel?: string;
};

export default function AlbumForm({ initial, onSubmit, busy, submitLabel = "Spara album" }: Props) {
  const [scanOpen, setScanOpen] = useState(false);

  const [title, setTitle] = useState<string>(initial?.title ?? "");
  const [artist, setArtist] = useState<string>(initial?.artist ?? "");
  const [year, setYear] = useState<number | "">(initial?.year ?? "");
  const [genres, setGenres] = useState<string>(
    Array.isArray(initial?.genres) ? initial!.genres!.join(", ") : ((initial?.genres as unknown as string) ?? "")
  );
  const [owned, setOwned] = useState<boolean>(!!initial?.owned);
  const [digital, setDigital] = useState<boolean>(!!initial?.digital);
  const [wishlisted, setWishlisted] = useState<boolean>(!!initial?.wishlisted);
  const [format, setFormat] = useState<Album["format"] | undefined>(initial?.format);
  const [coverUrl, setCoverUrl] = useState<string>(initial?.coverUrl ?? "");
  const [barcode, setBarcode] = useState<string>(initial?.barcode ?? "");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  const f = "w-full rounded-2xl";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      artist: artist.trim() || undefined,
      year: typeof year === "number" ? year : undefined,
      genres: genres
        .toString()
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      owned,
      digital,
      wishlisted,
      format,
      coverUrl: coverUrl || undefined,
      barcode: barcode || undefined,
      notes: notes || undefined,
    } as Omit<Album, "id" | "createdAt" | "updatedAt">);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card p-4 space-y-3">
        {/* Titel */}
        <div>
          <label className="block text-sm mb-1">Titel *</label>
          <input
            className={f}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Dark Side of the Moon"
          />
        </div>

        {/* Artist + År (2 kolumner som i GameForm) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Artist</label>
            <input
              className={f}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Pink Floyd"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">År</label>
            <input
              className={f}
              type="number"
              value={year ?? ""}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
              placeholder="1973"
            />
          </div>
        </div>

        {/* Genrer */}
        <div>
          <label className="block text-sm mb-1">Genrer (kommaseparerat)</label>
          <input
            className={f}
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            placeholder="Rock, Prog …"
          />
        </div>

        {/* Omslag */}
        <div>
          <label className="block text-sm mb-1">Omslagsbild (URL)</label>
          <input
            className={f}
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…/cover.jpg"
          />
        </div>

        {/* Streckkod */}
        <div>
          <label className="block text-sm mb-1">Streckkod (EAN/UPC)</label>
          <div className="flex items-center gap-2">
            <input
              className={`${f} flex-1`}
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
          <select
            className={f}
            value={format ?? ""}
            onChange={(e) => setFormat((e.target.value || undefined) as Album["format"])}
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
            className={f}
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Utgåva, press, matrix, skick …"
          />
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