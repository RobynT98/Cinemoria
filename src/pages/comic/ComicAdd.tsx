import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/db";
import ComicForm from "@/components/ComicForm";

export default function ComicAdd() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  async function onSubmit(data: any) {
    setBusy(true);
    const now = Date.now();
    await db.comics.add({ ...data, createdAt: now, updatedAt: now } as any);
    setBusy(false);
    nav("/comic");
  }
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Lägg till serietidning</h1>
      <ComicForm onSubmit={onSubmit} busy={busy} />
    </section>
  );
}