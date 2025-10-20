// src/components/BookForm.tsx
import { useState } from "react";
import { db, type Book, type BookFormat } from "@/db";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "@/components/BarcodeScanner";

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
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

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

  async function fetchBookByIsbn(isbn: string) {
    try {
      setLoading(true);
      const clean = isbn.replace(/[^0-9X]/gi, "");
      const r = await fetch(`https://openlibrary.org/isbn/${clean}.json`);
      if (!r.ok) {
        alert("Ingen bok hittades för det ISBN-numret.");
        return;
      }
      const data = await r.json();

      const cover = data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : b.coverUrl;

      const year = Number(data.publish_date?.match(/\d{4}/)?.[0]);
      const language = (data.languages?.[0]?.key?.split("/").pop() ?? "sv").toLowerCase();
      const publisher = Array.isArray(data.publishers) ? data.publishers[0] : undefined;

      setB((x) => ({
        ...x,
        title: data.title ?? x.title,
        year: year || x.year,
        coverUrl: cover,
        isbn: clean,
        language,
        pages: data.number_of_pages ?? x.pages,
        publisher: publisher ?? x.publisher,
      }));

      alert("Bokinfo hämtad!");
    } catch (e) {
      console.error(e);
      alert("Kunde inte hämta data från OpenLibrary.");
    } finally {
      setLoading(false);
    }
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
    <div className="card p-4 space-y-3 relative">
      {scanning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col p-4">
          <BarcodeScanner
            onResult={(code) => {
              setScanning(false);
              set("isbn", code);
              fetchBookByIsbn(code);
            }}
            onError={(err) => {
              console.error(err);
              setScanning(false);
              alert("Kunde inte starta kamera eller läsa streckkod.");
            }}
            onClose={() => setScanning(false)}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bokinformation</h2>
        <button className="btn-sm" onClick={() => setScanning(true)}>
          Skanna streckkod
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500">Hämtar bokdata...</div>}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">ISBN</label>
          <input
            type="text"
            value={b.isbn ?? ""}
            onChange={(e) => set("isbn", e.target.value)}
            placeholder="9781234567897"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Förlag</label>
          <input
            type="text"
            value={b.publisher ?? ""}
            onChange={(e) => set("publisher", e.target.value)}
            placeholder="Albert Bonniers"
          />
        </div>
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