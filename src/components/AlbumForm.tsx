import { useEffect, useState } from "react";
import { type Album } from "@/types";

type Props = {
  initial?: Partial<Album>;
  onSubmit: (data: Omit<Album, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
  busy?: boolean;
};
export default function AlbumForm({ initial, onSubmit, busy }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const [year, setYear] = useState<number | "">(initial?.year ?? "");
  const [genres, setGenres] = useState((initial?.genres ?? []).join(", "));
  const [owned, setOwned] = useState(!!initial?.owned);
  const [digital, setDigital] = useState(!!initial?.digital);
  const [wishlisted, setWishlisted] = useState(!!initial?.wishlisted);
  const [format, setFormat] = useState<Album["format"] | undefined>(initial?.format);

  useEffect(() => {
    setTitle(initial?.title ?? "");
  }, [initial?.title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      artist: artist.trim(),
      year: typeof year === "number" ? year : undefined,
      genres: genres.split(",").map(s => s.trim()).filter(Boolean),
      owned, digital, wishlisted,
      format,
      coverUrl: (initial?.coverUrl ?? "") || undefined,
      notes: (initial?.notes ?? "") || undefined,
    } as any);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">Titel *</span>
          <input required value={title} onChange={e=>setTitle(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Artist</span>
          <input value={artist} onChange={e=>setArtist(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">År</span>
          <input inputMode="numeric" value={year} onChange={e=>setYear(e.target.value ? Number(e.target.value) : "")}/>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Genrer (kommaseparerat)</span>
          <input value={genres} onChange={e=>setGenres(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="chip cursor-pointer"><input type="checkbox" className="mr-2" checked={owned} onChange={e=>setOwned(e.target.checked)} />Ägd</label>
        <label className="chip cursor-pointer"><input type="checkbox" className="mr-2" checked={digital} onChange={e=>setDigital(e.target.checked)} />Digital</label>
        <label className="chip cursor-pointer"><input type="checkbox" className="mr-2" checked={wishlisted} onChange={e=>setWishlisted(e.target.checked)} />Önskelista</label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">Format</span>
        <select value={format ?? ""} onChange={e=>setFormat((e.target.value || undefined) as any)}>
          <option value="">(välj)</option>
          <option value="cd">CD</option>
          <option value="vinyl">Vinyl</option>
          <option value="cassette">Kassett</option>
          <option value="digital">Digital</option>
          <option value="other">Övrigt</option>
        </select>
      </label>

      <div className="pt-2">
        <button className="btn btn-primary" disabled={busy} type="submit">Spara</button>
      </div>
    </form>
  );
}