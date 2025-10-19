// src/pages/book/BookAdd.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBook, type BookFormat } from "@/db";

type FormState = {
  title: string;
  author: string;
  year: string;       // håll som string i formuläret, parsas vid submit
  pages: string;
  language: string;
  format: BookFormat; // "paperback" | "hardcover" | "ebook" | "audiobook" | "other"
  isbn: string;
  publisher: string;
  genres: string;     // kommaseparerad i UI → array vid submit
  coverUrl: string;
  notes: string;
  owned: boolean;
  digital: boolean;
  wishlisted: boolean;
};

export default function BookAdd() {
  const navigate = useNavigate();

  const [book, setBook] = useState<FormState>({
    title: "",
    author: "",
    year: "",
    pages: "",
    language: "sv",
    format: "other",
    isbn: "",
    publisher: "",
    genres: "",
    coverUrl: "",
    notes: "",
    owned: true,
    digital: false,
    wishlisted: false,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const t = e.target;
    const { name, value } = t;

    // checkboxar finns bara på HTMLInputElement
    if (t instanceof HTMLInputElement && t.type === "checkbox") {
      setBook((prev) => ({ ...prev, [name]: t.checked }));
    } else {
      setBook((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const yearNum = book.year ? Number(book.year) : undefined;
    const pagesNum = book.pages ? Number(book.pages) : undefined;

    const payload = {
      title: book.title.trim(),
      author: book.author.trim() || undefined,
      year: Number.isFinite(yearNum!) ? yearNum : undefined,
      pages: Number.isFinite(pagesNum!) ? pagesNum : undefined,
      language: book.language.trim() || undefined,
      format: book.format as BookFormat,
      isbn: book.isbn.trim() || undefined,
      publisher: book.publisher.trim() || undefined,
      coverUrl: book.coverUrl.trim() || undefined,
      notes: book.notes.trim() || undefined,
      genres:
        book.genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean) || undefined,
      owned: !!book.owned,
      digital: !!book.digital,
      wishlisted: !!book.wishlisted,
    } as const;

    if (!payload.title) {
      alert("Titel krävs.");
      return;
    }

    await addBook(payload as any);
    alert("Bok sparad!");
    navigate("/book");
  }

  return (
    <section className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Lägg till bok</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium">Titel</label>
          <input
            type="text"
            name="title"
            value={book.title}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Författare</label>
          <input
            type="text"
            name="author"
            value={book.author}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">År</label>
            <input
              type="number"
              name="year"
              inputMode="numeric"
              value={book.year}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Sidor</label>
            <input
              type="number"
              name="pages"
              inputMode="numeric"
              value={book.pages}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Språk</label>
            <input
              type="text"
              name="language"
              placeholder="sv, en …"
              value={book.language}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Format</label>
            <select
              name="format"
              value={book.format}
              onChange={handleChange}
              className="w-full"
            >
              <option value="other">Övrigt</option>
              <option value="paperback">Pocket</option>
              <option value="hardcover">Inbunden</option>
              <option value="ebook">E-bok</option>
              <option value="audiobook">Ljudbok</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">ISBN</label>
          <input
            type="text"
            name="isbn"
            value={book.isbn}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Förlag</label>
          <input
            type="text"
            name="publisher"
            value={book.publisher}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Genrer (kommaseparerade)
          </label>
          <input
            type="text"
            name="genres"
            value={book.genres}
            onChange={handleChange}
            className="w-full"
            placeholder="Skräck, Fantasy …"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Omslagsbild (URL)</label>
          <input
            type="url"
            name="coverUrl"
            value={book.coverUrl}
            onChange={handleChange}
            className="w-full"
            placeholder="https://…"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Anteckningar</label>
          <textarea
            name="notes"
            value={book.notes}
            onChange={handleChange}
            className="w-full"
            rows={3}
          />
        </div>

        <fieldset className="mt-3">
          <legend className="text-sm font-medium mb-2">Status</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="owned"
                checked={book.owned}
                onChange={handleChange}
              />
              <span>Ägd</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="digital"
                checked={book.digital}
                onChange={handleChange}
              />
              <span>Digital</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="wishlisted"
                checked={book.wishlisted}
                onChange={handleChange}
              />
              <span>Önskelista</span>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary mt-2"
        >
          Spara bok
        </button>
      </form>
    </section>
  );
}