import { useState } from "react";
import type { Book, BookFormat } from "@/db";

type Props = {
  initial?: Book;
  submitLabel: string;
  onSubmit: (data: Omit<Book, "id"> & { id?: number }) => Promise<void> | void;
};

const formats: { value: BookFormat; label: string }[] = [
  { value: "hardcover", label: "Inbunden" },
  { value: "paperback", label: "Pocket" },
  { value: "ebook", label: "E-bok" },
  { value: "audiobook", label: "Ljudbok" },
  { value: "other", label: "Övrigt" },
];

export default function BookForm({ initial, submitLabel, onSubmit }: Props) {
  const [b, setB] = useState<Book>(
    initial ?? {
      title: "",
      author: "",
      year: undefined,
      genres: [],
      coverUrl: "",
      owned: true,
      wishlisted: false,
      digital: false,
      format: "other",
      isbn: "",
      language: "sv",
      pages: undefined,
      publisher: "",
      notes: "",
      createdAt: Date.now(),
    }
  );

  function set<K extends keyof Book>(key: K, val: Book[K]) {
    setB((x) => ({ ...x, [key]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!b.title.trim()) return alert("Titel krävs");
    await onSubmit({ ...b, createdAt: b.createdAt || Date.now() });
  }

  return (
    <form onSubmit={save} className="card p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input value={b.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Författare</label>
          <input value={b.author ?? ""} onChange={(e) => set("author", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            type="number"
            value={b.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Sidor</label>
          <input
            type="number"
            value={b.pages ?? ""}
            onChange={(e) => set("pages", Number(e.target.value) || undefined)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Språk</label>
          <input
            placeholder="sv, en, …"
            value={b.language ?? ""}
            onChange={(e) => set("language", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Format</label>
          <select
            value={b.format ?? "other"}
            onChange={(e) => set("format", e.target.value as BookFormat)}
          >
            {formats.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">ISBN</label>
          <input value={b.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Förlag</label>
          <input value={b.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Genrer (kommaseparerade)</label>
        <input
          value={b.genres?.join(", ") ?? ""}
          onChange={(e) =>
            set(
              "genres",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Omslagsbild (URL)</label>
          <input value={b.coverUrl ?? ""} onChange={(e) => set("coverUrl", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Anteckningar</label>
          <input value={b.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      <div className="card p-3">
        <h3 className="font-semibold mb-2">Status</h3>
        <div className="flex gap-4 flex-wrap">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!b.owned}
              onChange={(e) => set("owned", e.target.checked)}
            />
            Ägd
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!b.digital}
              onChange={(e) => set("digital", e.target.checked)}
            />
            Digital
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!b.wishlisted}
              onChange={(e) => set("wishlisted", e.target.checked)}
            />
            Önskelista
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button className="btn btn-primary" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}