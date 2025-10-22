import { useEffect, useState } from "react";
import { getComic, updateComic, type Comic } from "@/db";
import { useParams, useNavigate } from "react-router-dom";
import ComicForm from "@/components/ComicForm";

export default function ComicEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState<Comic | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const num = Number(id);
    if (!num) return;
    getComic(num).then((c) => {
      if (!c) setNotFound(true);
      else setComic(c);
    });
  }, [id]);

  if (notFound) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Hittar inte serien</h1>
        <p className="text-sand-300">Den kan ha tagits bort.</p>
      </section>
    );
  }

  if (!comic) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Redigerar…</h1>
        <div className="card p-6">Laddar serie…</div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Redigera serie</h1>
      <ComicForm
        initial={comic}
        submitLabel="Spara ändringar"
        onSubmit={async (data) => {
          await updateComic(comic.id!, data);
          alert("Uppdaterad!");
          navigate(-1);
        }}
      />
    </section>
  );
}