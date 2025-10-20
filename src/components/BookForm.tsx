import { useState } from "react";
import { db, type Book, type BookFormat } from "@/db";
import { useNavigate } from "react-router-dom";

interface BookFormProps {
  initial?: Book;
  submitLabel: string;
  onSubmit?: (data: Book) => Promise<void>;
}

const formatOptions: { value: BookFormat; label: string }[] = [
  { value: "other", label: "Övrigt" },
  { value: "paperback", label: "Pocket" },
  { value: "hardcover", label: "Inbunden" },
  { value: "ebook", label: "E-bok" },
  { value: "audiobook", label: "Ljudbok" },
];

export default function BookForm({ initial, submitLabel, onSubmit }: BookFormProps) {
  const nav = useNavigate();

  const [b, setB] = useState<Book>(
    initial ?? {
      title: "",
      author: "",
      year: undefined,
      genres: [],
      coverUrl: "",
      owned: true,
      digital: false,
      wishlisted: false,
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

  async function save() {
    if (!b.title.trim()) return alert("Titel krävs");
    const data: Book = { ...b, createdAt: b.createdAt || Date.now() };

    if (onSubmit) {
      await onSubmit(data);
    } else {
      if (initial?.id != null) {
        await db.books.put({ ...data, id: initial.id });
      } else {
        await db.books.add(data);
      }
      nav("/book");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Titel & Författare */}
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <input
          type="text"
          value={b.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Den hemliga historien"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Författare</label>
        <input
          type="text"
          value={b.author ?? ""}
          onChange={(e) => set("author", e.target.value)}
          placeholder="Donna Tartt"
        />
      </div>

      {/* År & Sidor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            type="number"
            value={b.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
            placeholder="1992"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Sidor</label>
          <input
            type="number"
            value={b.pages ?? ""}
            onChange={(e) => set("pages", Number(e.target.value) || undefined)}
            placeholder="560"
          />
        </div>
      </div>

      {/* Språk & Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Språk</label>
          <input
            type="text"
            value={b.language ?? ""}
            onChange={(e) => set("language", e.target.value)}
            placeholder="sv"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Format</label>
          <select
            value={b.format ?? "other"}
            onChange={(e) => set("format", e.target.value as BookFormat)}
          >
            {formatOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ISBN & Förlag */}
      <div>
        <label className="block text-sm mb-1">ISBN</label>
        <input type="text" value={b.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">Förlag</label>
        <input type="text" value={b.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} />
      </div>

      {/* Genrer */}
      <div>
        <label className="block text-sm mb-1">Genrer (kommaseparerade)</label>
        <input
          type="text"
          value={(b.genres ?? []).join(", ")}
          onChange={(e) =>
            set(
              "genres",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          placeholder="Skräck, Fantasy …"
        />
      </div>

      {/* Omslag & Anteckningar */}
      <div>
        <label className="block text-sm mb-1">Omslagsbild (URL)</label>
        <input
          type="url"
          value={b.coverUrl ?? ""}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="https://…"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Anteckningar</label>
        <textarea rows={4} value={b.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </div>

      {/* Status */}
      <div className="card p-3">
        <h3 className="font-semibold mb-2">Status</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!b.owned} onChange={(e) => set("owned", e.target.checked)} />
            Ägd
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!b.digital} onChange={(e) => set("digital", e.target.checked)} />
            Digital
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!b.wishlisted} onChange={(e) => set("wishlisted", e.target.checked)} />
            Önskelista
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button className="btn btn-primary" onClick={save}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}