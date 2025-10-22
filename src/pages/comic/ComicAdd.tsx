// src/pages/comic/ComicAdd.tsx
import { useNavigate } from "react-router-dom";
import ComicForm from "@/components/ComicForm";
import { addComic } from "@/db";
import type { Comic } from "@/db";

export default function ComicAdd() {
  const navigate = useNavigate();

  async function handleSubmit(data: Omit<Comic, "id" | "createdAt" | "updatedAt">) {
    await addComic(data);
    alert("Serien sparad!");
    navigate("/comic");
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till serie</h1>
      <ComicForm submitLabel="Spara serie" onSubmit={handleSubmit} />
    </section>
  );
}