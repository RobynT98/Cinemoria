import { useEffect, useState } from "react";
import { getAlbum, updateAlbum, type Album } from "@/db";
import { useParams, useNavigate } from "react-router-dom";
import AlbumForm from "@/components/AlbumForm";

export default function AlbumEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const num = Number(id);
    if (!num) return;
    getAlbum(num).then((a) => {
      if (!a) setNotFound(true);
      else setAlbum(a);
    });
  }, [id]);

  if (notFound) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Hittar inte albumet</h1>
        <p className="text-sand-300">Det kan ha tagits bort.</p>
      </section>
    );
  }

  if (!album) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Redigerar…</h1>
        <div className="card p-6">Laddar album…</div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Redigera album</h1>
      <AlbumForm
        initial={album}
        submitLabel="Spara ändringar"
        onSubmit={async (data) => {
          await updateAlbum(album.id!, data);
          alert("Uppdaterad!");
          navigate(-1);
        }}
      />
    </section>
  );
}