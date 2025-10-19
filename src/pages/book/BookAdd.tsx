// src/pages/book/BookAdd.tsx
import BookForm from "@/components/BookForm";
import { addBook } from "@/db";

export default function BookAdd() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till bok</h1>
      <BookForm
        submitLabel="Spara bok"
        onSubmit={async (data) => {
          await addBook({
            title: data.title,
            author: data.author,
            year: data.year,
            coverUrl: data.coverUrl,
            owned: !!data.owned,
            digital: !!data.digital,
            wishlisted: !!data.wishlisted,
            format: (data as any).format ?? "other",
            language: data.language,
            isbn: data.isbn,
            pages: data.pages,
            publisher: data.publisher,
            genres: data.genres ?? [],
            notes: data.notes,
          } as any);
          alert("Sparad!");
        }}
      />
    </section>
  );
}