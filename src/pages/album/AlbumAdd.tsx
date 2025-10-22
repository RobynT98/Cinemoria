// src/pages/album/AlbumAdd.tsx
import { useNavigate } from "react-router-dom";
import AlbumForm from "@/components/AlbumForm";
import { addAlbum } from "@/db";
import type { Album } from "@/db";

export default function AlbumAdd() {
  const navigate = useNavigate();

  async function handleSubmit(data: Omit<Album, "id" | "createdAt" | "updatedAt">) {
    await addAlbum(data);
    alert("Album sparat!");
    navigate("/album");
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till album</h1>
      <AlbumForm submitLabel="Spara album" onSubmit={handleSubmit} />
    </section>
  );
}