import { useEffect, useState } from "react";
import { getBook, updateBook, type Book } from "@/db";
import { useParams, useNavigate } from "react-router-dom";
import BookForm from "@/components/BookForm";

export default function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const num = Number(id);
    if (!num) return;
    getBook(num).then((b) => {
      if (!b) setNotFound(true);
      else setBook(b);
    });
  }, [id]);

  if (notFound) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Hittar inte boken</h1>
        <p className="text-sand-300">Den kan ha tagits bort.</p>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Redigerar…</h1>
        <div className="card p-6">Laddar bok…</div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-3">Redigera bok</h1>
      <BookForm
        initial={book}
        submitLabel="Spara ändringar"
        onSubmit={async (data) => {
          await updateBook(book.id!, data);
          alert("Uppdaterad!");
          navigate(-1);
        }}
      />
    </section>
  );
}