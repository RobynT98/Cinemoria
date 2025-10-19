import { useState } from "react";

export default function BookAdd() {
  const [book, setBook] = useState({
    title: "",
    author: "",
    year: "",
    pages: "",
    language: "sv",
    format: "Övrigt",
    isbn: "",
    publisher: "",
    genres: "",
    coverUrl: "",
    notes: "",
    owned: false,
    digital: false,
    wishlist: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setBook((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: spara i localStorage eller backend
    console.log("Sparad bok:", book);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Lägg till bok</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium">Titel</label>
          <input
            type="text"
            name="title"
            value={book.title}
            onChange={handleChange}
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
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
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">År</label>
            <input
              type="number"
              name="year"
              value={book.year}
              onChange={handleChange}
              className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Sidor</label>
            <input
              type="number"
              name="pages"
              value={book.pages}
              onChange={handleChange}
              className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Språk</label>
            <input
              type="text"
              name="language"
              value={book.language}
              onChange={handleChange}
              className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Format</label>
            <select
              name="format"
              value={book.format}
              onChange={handleChange}
              className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
            >
              <option value="Övrigt">Övrigt</option>
              <option value="Pocket">Pocket</option>
              <option value="Inbunden">Inbunden</option>
              <option value="E-bok">E-bok</option>
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
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Förlag</label>
          <input
            type="text"
            name="publisher"
            value={book.publisher}
            onChange={handleChange}
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Genrer (kommaseparerade)</label>
          <input
            type="text"
            name="genres"
            value={book.genres}
            onChange={handleChange}
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Omslagsbild (URL)</label>
          <input
            type="text"
            name="coverUrl"
            value={book.coverUrl}
            onChange={handleChange}
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Anteckningar</label>
          <textarea
            name="notes"
            value={book.notes}
            onChange={handleChange}
            className="w-full rounded-md border border-sand-300 bg-transparent px-3 py-2"
            rows={3}
          />
        </div>

        <fieldset className="mt-4">
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
                name="wishlist"
                checked={book.wishlist}
                onChange={handleChange}
              />
              <span>Önskelista</span>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-accent-500 text-white py-2 font-medium hover:bg-accent-600 transition"
        >
          Spara bok
        </button>
      </form>
    </div>
  );
}