// src/pages/book/BookAdd.tsx
import BookForm from "@/components/book/BookForm";
import { addBook } from "@/db";

export default function BookAdd() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till bok</h1>
      <BookForm
        submitLabel="Spara bok"
        onSubmit={async (data) => {
          await addBook(data);
          alert("Bok sparad!");
        }}
      />
    </section>
  );
}