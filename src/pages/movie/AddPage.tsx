import { useNavigate } from "react-router-dom";
import MovieForm from "@/components/MovieForm";
import { addMovie } from "@/db";
import type { Movie } from "@/db";

export default function AddPage() {
  const navigate = useNavigate();

  async function handleSubmit(data: Movie) {
    await addMovie(data);
    alert("Filmen sparad!");
    navigate("/movie");
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till film</h1>
      <MovieForm submitLabel="Spara film" onSubmit={handleSubmit} />
    </section>
  );
}