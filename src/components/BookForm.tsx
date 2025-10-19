// src/components/BookForm.tsx
import { useState } from "react";
import { Book, addBook, updateBook } from "@/db";
import { useNavigate } from "react-router-dom";

type Props = {
  initial?: Book;
  submitLabel?: string;
  onSubmit?: (data: Book) => Promise<void>;
};

const formats = [
  { value: "hardcover", label: "Inbunden" },
  { value: "paperback", label: "Pocket" },
  { value: "ebook", label: "E-bok" },
  { value: "audiobook", label: "Ljudbok" },
  { value: "other", label: "Övrigt" },
] as const;

export default function BookForm({ initial, submitLabel = "Spara bok", onSubmit }: Props) {
  const nav = useNavigate();
  const [b, setB] = useState<Book>(
    initial ?? {
      title: "",
      author: "",
      year: undefined,
      coverUrl: "",
      createdAt: Date.now(),
      owned: true,
      digital: false,
      wishlisted: false,
      format: "other",
      language: "sv",
      isbn: "",
      pages: undefined,
      publisher: "",
      genres: [],
      notes: "",
    } as Book
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
      if (initial?.id) await updateBook(initial.id as number, data);
      else await addBook(data as Omit<Book, "id" | "createdAt">);
      nav("/book");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Grund */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input value={b.title} onChange={(e) => set("title", e.target.value)} type="text" />
        </div>
        <div>
          <label className="block text-sm mb-1">Författare</label>
          <input value={b.author ?? ""} onChange={(e) => set("author", e.target.value)} type="text" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">År</label>
          <input
            value={b.year ?? ""}
            onChange={(e) => set("year", Number(e.target.value) || undefined)}
            type="number"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Sidor</label>
          <input
            value={b.pages ?? ""}
            onChange={(e) => set("pages", Number(e.target.value) || undefined)}
            type="number"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Omslag (URL)</label>
          <input value={b.coverUrl ?? ""} onChange={(e) => set("coverUrl", e.target.value)} type="url" />
        </div>
        <div>
          <label className="block text-sm mb-1">Språk (ISO, t.ex. sv/en)</label>
          <input
            value={b.language ?? ""}
            onChange={(e) => set("language", e.target.value.trim().toLowerCase())}
            type="text"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">ISBN</label>
          <input value={b.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} type="text" />
        </div>
        <div>
          <label className="block text-sm mb-1">Förlag</label>
          <input value={b.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} type="text" />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Genrer (kommaseparerade)</label>
        <input
          value={b.genres?.join(", ") ?? ""}
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

      {/* Ägande */}
      <div className="card p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <h3 className="font-semibold mb-2">Ägande</h3>
          <div className="flex items-center gap-3 flex-wrap">
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

          <div className="mt-3">
            <label className="block text-sm mb-1">Format</label>
            <select
              value={(b.format as any) ?? "other"}
              onChange={(e) => set("format", e.target.value as any)}
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Anteckningar */}
        <div>
          <h3 className="font-semibold mb-2">Anteckningar</h3>
          <textarea
            rows={4}
            placeholder="Första upplagan, signerad, dammskydd saknas…"
            value={b.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2">
        <button className="btn btn-primary" onClick={save}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}