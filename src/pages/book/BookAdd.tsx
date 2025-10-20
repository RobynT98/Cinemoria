import { useNavigate } from "react-router-dom";
import BookForm from "@/components/BookForm";
import { addBook } from "@/db";
import type { Book } from "@/db";

export default function BookAdd() {
  const navigate = useNavigate();

  async function handleSubmit(data: Book) {
    await addBook(data);
    alert("Boken sparad!");
    navigate("/book");
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till bok</h1>
      <BookForm submitLabel="Spara bok" onSubmit={handleSubmit} />
    </section>
  );
}