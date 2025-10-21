import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, type Album } from "@/db";
import AlbumForm from "@/components/AlbumForm";

export default function AlbumEdit() {
  const { id } = useParams<{id: string}>();
  const nav = useNavigate();
  const [album, setAlbum] = useState<Album | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (id) db.albums.get(Number(id)).then(setAlbum); }, [id]);

  async function onSubmit(data: any) {
    if (!album?.id) return;
    setBusy(true);
    await db.albums.update(album.id, { ...data, updatedAt: Date.now() } as any);
    setBusy(false);
    nav("/album");
  }

  if (!album) return <div className="p-4">Hämtar…</div>;
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Redigera album</h1>
      <AlbumForm initial={album} onSubmit={onSubmit} busy={busy} />
    </section>
  );
}