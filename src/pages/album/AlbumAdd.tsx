import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/db";
import AlbumForm from "@/components/AlbumForm";

export default function AlbumAdd() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(data: any) {
    setBusy(true);
    const now = Date.now();
    await db.albums.add({ ...data, createdAt: now, updatedAt: now } as any);
    setBusy(false);
    nav("/album");
  }
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Lägg till album</h1>
      <AlbumForm onSubmit={onSubmit} busy={busy} />
    </section>
  );
}