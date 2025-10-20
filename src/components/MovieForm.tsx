// src/components/MovieForm.tsx
import { useState } from "react";
import { db, Movie, Format, VideoStandard, RegionCode } from "@/db";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

interface MovieFormProps {
  initial?: Movie;
  submitLabel: string;
  onSubmit?: (data: Movie) => Promise<void>;
}

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

const OMDB_KEY = import.meta.env.VITE_OMDB_KEY as string | undefined;

export default function MovieForm({ initial, submitLabel, onSubmit }: MovieFormProps) {
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
  const [omdbBusy, setOmdbBusy] = useState(false);

  function set<K extends keyof Movie>(key: K, val: Movie[K]) {
    setM((x) => ({ ...x, [key]: val }));
  }

  const regionOptions: RegionCode[] =
    m.format === "bluray" ? bluRegions : m.format === "dvd" ? dvdRegions : noneRegion;

  async function save() {
    if (!m.title.trim()) return alert("Titel krävs");
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

  async function fetchFromOmdb() {
    if (!OMDB_KEY) {
      alert("Saknar OMDb-nyckel. Lägg VITE_OMDB_KEY i .env och ladda om.");
      return;
    }
    const title = m.title.trim();
    if (!title) {
      alert("Skriv en titel först.");
      return;
    }

    setOmdbBusy(true);
    try {
      // 1) Försök exakt titel (t=)
      const exactUrl = new URL("https://www.omdbapi.com/");
      exactUrl.searchParams.set("apikey", OMDB_KEY);
      exactUrl.searchParams.set("t", title);
      if (m.year) exactUrl.searchParams.set("y", String(m.year));

      let res = await fetch(exactUrl.toString());
      let data = (await res.json()) as any;

      // 2) Om ingen exakt träff, försök sökning (s=) och ta första
      if (data?.Response === "False") {
        const searchUrl = new URL("https://www.omdbapi.com/");
        searchUrl.searchParams.set("apikey", OMDB_KEY);
        searchUrl.searchParams.set("s", title);
        const sres = await fetch(searchUrl.toString());
        const sdata = (await sres.json()) as any;

        const first = Array.isArray(sdata?.Search) ? sdata.Search[0] : undefined;
        if (first?.imdbID) {
          const byIdUrl = new URL("https://www.omdbapi.com/");
          byIdUrl.searchParams.set("apikey", OMDB_KEY);
          byIdUrl.searchParams.set("i", first.imdbID);
          const idRes = await fetch(byIdUrl.toString());
          data = await idRes.json();
        }
      }

      if (!data || data.Response === "False") {
        alert("Hittade ingen matchning på OMDb.");
        return;
      }

      // Mappa fält
      const yearParsed = parseYear(data.Year);
      const poster = data.Poster && data.Poster !== "N/A" ? data.Poster : "";
      const genres =
        typeof data.Genre === "string"
          ? data.Genre.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      const omdbSummary = buildOmdbNotes(data);

      setM((prev) => ({
        ...prev,
        title: prev.title || data.Title || prev.title,
        year: prev.year ?? yearParsed,
        posterUrl: prev.posterUrl || poster,
        genres: prev.genres && prev.genres.length ? prev.genres : genres,
        notes: prev.notes
          ? prev.notes
          : omdbSummary, // bara sätt om tomt – så vi inte skriver över egna anteckningar
      }));
    } catch (e) {
      console.error(e);
      alert("Något gick snett vid hämtning från OMDb.");
    } finally {
      setOmdbBusy(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Titel + OMDb-knapp */}
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <div className="flex gap-2">
          <input
            value={m.title}
            onChange={(e) => set("title", e.target.value)}
            type="text"
            className="flex-1"
            placeholder="Skriv titel…"
          />
          <button
            type="button"
            className="btn"
            onClick={fetchFromOmdb}
            disabled={omdbBusy}
            title="Hämta från OMDb"
          >
            <Search size={16} className="mr-1" />
            {omdbBusy ? "Hämtar…" : "Hämta från OMDb"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            value={m.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
            type="number"
            placeholder="t.ex. 2004"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Betyg (1–10)</label>
          <input
            value={m.rating ?? ""}
            onChange={(e) => set("rating", Number(e.target.value) || undefined)}
            type="number"
            min={1}
            max={10}
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
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Trailer URL</label>
          <input
            value={m.trailerUrl ?? ""}
            onChange={(e) => set("trailerUrl", e.target.value)}
            type="url"
            placeholder="https://youtube.com/watch?v=…"
          />
        </div>
      </div>

      {/* Ägande */}
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
                placeholder="iTunes / Google / Plex …"
              />
            </div>
          </div>
        </div>

        {/* Utgåva & Teknik */}
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
  );
}

/* ---------- Hjälpare ---------- */

function parseYear(yearStr?: string): number | undefined {
  if (!yearStr) return undefined;
  // OMDb kan ge "1999", "1999–2001" eller "1999–"
  const m = String(yearStr).match(/^(\d{4})/);
  return m ? Number(m[1]) : undefined;
}

function buildOmdbNotes(d: any): string {
  const parts: string[] = [];
  if (d.Director && d.Director !== "N/A") parts.push(`Regi: ${d.Director}`);
  if (d.Actors && d.Actors !== "N/A")
    parts.push(`Skådespelare: ${truncateList(d.Actors, 4)}`);
  if (d.Runtime && d.Runtime !== "N/A") parts.push(`Längd: ${d.Runtime}`);
  if (d.Rated && d.Rated !== "N/A") parts.push(`Rated: ${d.Rated}`);
  if (d.imdbRating && d.imdbRating !== "N/A")
    parts.push(`IMDb: ${d.imdbRating}/10`);
  if (d.Plot && d.Plot !== "N/A") parts.push(`Plot: ${d.Plot}`);
  return parts.join(" • ");
}

function truncateList(list: string, max: number) {
  const arr = list.split(",").map((s) => s.trim());
  return arr.length > max ? arr.slice(0, max).join(", ") + " …" : list;
}