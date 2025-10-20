// src/components/MovieForm.tsx
import { useState } from "react";
import { db, type Movie, type Format, type VideoStandard, type RegionCode } from "@/db";
import { useNavigate } from "react-router-dom";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

interface MovieFormProps {
  initial?: Movie;
  submitLabel: string;
  onSubmit?: (data: Movie) => Promise<void>;
}

/** Format-labels för dropdownen */
const formats: { value: Format; label: string }[] = [
  { value: "uhd", label: "4K UHD" },
  { value: "bluray", label: "Blu-ray" },
  { value: "dvd", label: "DVD" },
  { value: "digital", label: "Digital" },
  { value: "vhs", label: "VHS" },
  { value: "other", label: "Övrigt" },
];

const videoStandards: VideoStandard[] = ["PAL", "NTSC", "SECAM"];
const bluRegions: RegionCode[] = ["BD-A", "BD-B", "BD-C"];
const dvdRegions: RegionCode[] = [
  "DVD-1",
  "DVD-2",
  "DVD-3",
  "DVD-4",
  "DVD-5",
  "DVD-6",
  "DVD-ALL",
];
const noneRegion: RegionCode[] = ["NONE"];

export default function MovieForm({ initial, submitLabel, onSubmit }: MovieFormProps) {
  const nav = useNavigate();
  const [showScan, setShowScan] = useState(false);

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
      edition: "",
      releaseYear: undefined,
      cut: "",
      audioVariant: "",
      videoStandard: undefined,
      region: "NONE",
      barcode: "",
      notes: "",
    }
  );

  function set<K extends keyof Movie>(key: K, val: Movie[K]) {
    setM((x) => ({ ...x, [key]: val }));
  }

  const regionOptions: RegionCode[] =
    m.format === "bluray" ? bluRegions : m.format === "dvd" ? dvdRegions : noneRegion;

  async function save() {
    if (!m.title.trim()) {
      alert("Titel krävs");
      return;
    }
    const data: Movie = { ...m, createdAt: m.createdAt || Date.now() };

    if (onSubmit) {
      await onSubmit(data);
    } else {
      if (initial?.id != null) {
        await db.movies.put({ ...data, id: initial.id });
      } else {
        await db.movies.add(data);
      }
      nav("/movie");
    }
  }

  /** Hämta metadata från OMDb med titel + (valfritt) år */
  async function fetchFromOMDb() {
    const title = m.title.trim();
    if (!title) {
      alert("Fyll i titel först.");
      return;
    }
    const apiKey = import.meta.env.VITE_OMDB_KEY;
    if (!apiKey) {
      alert("Ingen OMDb-nyckel hittades (VITE_OMDB_KEY). Lägg in den i .env-filen.");
      return;
    }

    try {
      const url = new URL("https://www.omdbapi.com/");
      url.searchParams.set("apikey", apiKey);
      url.searchParams.set("t", title);
      if (m.year) url.searchParams.set("y", String(m.year));
      url.searchParams.set("plot", "short");

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data?.Response === "False") {
        alert(data?.Error || "Hittade inget i OMDb.");
        return;
      }

      const poster =
        typeof data.Poster === "string" && data.Poster !== "N/A" ? data.Poster : "";
      const yearParsed = parseInt(data.Year, 10);
      const genres =
        typeof data.Genre === "string"
          ? data.Genre.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      setM((x) => ({
        ...x,
        title: data.Title || x.title,
        year: Number.isFinite(yearParsed) ? yearParsed : x.year,
        posterUrl: poster || x.posterUrl,
        genres: genres.length ? genres : x.genres,
      }));
    } catch (err) {
      console.error(err);
      alert("Kunde inte hämta från OMDb just nu.");
    }
  }

  /** När en streckkod lästs in från kameradialogen */
  function handleDetected(code: string) {
    set("barcode", code);
    setShowScan(false);
  }

  return (
    <>
      <div className="card p-4 space-y-3">
        {/* Top actions */}
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={() => setShowScan(true)}>
            Skanna streckkod
          </button>
          <button className="btn" onClick={fetchFromOMDb}>
            Hämta från OMDb
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input value={m.title} onChange={(e) => set("title", e.target.value)} type="text" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">År</label>
            <input
              value={m.year ?? ""}
              onChange={(e) => set("year", Number(e.target.value) || undefined)}
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Betyg (1–10)</label>
            <input
              value={m.rating ?? ""}
              onChange={(e) => set("rating", Number(e.target.value) || undefined)}
              type="number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Genrer (kommaseparerade)</label>
          <input
            value={m.genres?.join(", ") ?? ""}
            onChange={(e) =>
              set(
                "genres",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            type="text"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Poster URL</label>
            <input
              value={m.posterUrl ?? ""}
              onChange={(e) => set("posterUrl", e.target.value)}
              type="url"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Trailer URL</label>
            <input
              value={m.trailerUrl ?? ""}
              onChange={(e) => set("trailerUrl", e.target.value)}
              type="url"
            />
          </div>
        </div>

        {/* Ägande + release/teknik */}
        <div className="card p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold mb-2">Ägande</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!m.owned}
                  onChange={(e) => set("owned", e.target.checked)}
                />
                Ägd
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!m.digital}
                  onChange={(e) => set("digital", e.target.checked)}
                />
                Digital
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!m.wishlisted}
                  onChange={(e) => set("wishlisted", e.target.checked)}
                />
                Önskelista
              </label>
            </div>

            <div className="mt-3">
              <label className="block text-sm mb-1">Format</label>
              <select
                value={m.format ?? "other"}
                onChange={(e) => set("format", e.target.value as Format)}
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Plats / Hylla</label>
                <input
                  value={m.location ?? ""}
                  onChange={(e) => set("location", e.target.value)}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tjänst / Leverantör</label>
                <input
                  value={m.provider ?? ""}
                  onChange={(e) => set("provider", e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Utgåva & Teknik</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Utgåva</label>
                <input
                  placeholder="Steelbook / First Press UK…"
                  value={m.edition ?? ""}
                  onChange={(e) => set("edition", e.target.value)}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Utgåveår</label>
                <input
                  value={m.releaseYear ?? ""}
                  onChange={(e) =>
                    set("releaseYear", Number(e.target.value) || undefined)
                  }
                  type="number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm mb-1">Cut</label>
                <input
                  placeholder="Theatrical / Extended…"
                  value={m.cut ?? ""}
                  onChange={(e) => set("cut", e.target.value)}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Ljudvariant</label>
                <input
                  placeholder="Original UK / US dub…"
                  value={m.audioVariant ?? ""}
                  onChange={(e) => set("audioVariant", e.target.value)}
                  type="text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm mb-1">Videostandard</label>
                <select
                  value={m.videoStandard ?? ""}
                  onChange={(e) =>
                    set("videoStandard", (e.target.value || undefined) as any)
                  }
                >
                  <option value="">–</option>
                  {videoStandards.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Region</label>
                <select
                  value={m.region ?? "NONE"}
                  onChange={(e) => set("region", e.target.value as RegionCode)}
                >
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm mb-1">Streckkod (EAN/UPC)</label>
                <input
                  placeholder="t.ex. 5051892191831"
                  value={m.barcode ?? ""}
                  onChange={(e) => set("barcode", e.target.value)}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Anteckningar</label>
                <input
                  placeholder="Britisk dubb, ny master…"
                  value={m.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-3">
          <h3 className="font-semibold mb-2">Status</h3>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!m.seen}
              onChange={(e) => set("seen", e.target.checked)}
            />
            Sett
          </label>
        </div>

        <div className="pt-2 flex gap-2">
          <button className="btn btn-primary" onClick={save}>
            {submitLabel}
          </button>
        </div>
      </div>

      {/* Kamera-dialog för streckkod */}
      {showScan && (
        <BarcodeScannerDialog onDetected={handleDetected} onClose={() => setShowScan(false)} />
      )}
    </>
  );
}