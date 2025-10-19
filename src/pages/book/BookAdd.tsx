// src/pages/book/BookAdd.tsx
import BookForm from "@/components/book/BookForm";
import { addBook } from "@/db";
import { useNavigate } from "react-router-dom";

export default function BookAdd() {
  const navigate = useNavigate();

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till bok</h1>
      <BookForm
        submitLabel="Spara bok"
        onSubmit={async (data) => {
          await addBook(data);
          alert("Bok sparad!");
          navigate("/book"); // samma upplevelse som spel/film
        }}
      />
    </section>
  );
}