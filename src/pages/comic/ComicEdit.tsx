import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, type Comic } from "@/db";
import ComicForm from "@/components/ComicForm";

export default function ComicEdit() {
  const { id } = useParams<{id: string}>();
  const nav = useNavigate();
  const [item, setItem] = useState<Comic | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (id) db.comics.get(Number(id)).then(setItem); }, [id]);

  async function onSubmit(data: any) {
    if (!item?.id) return;
    setBusy(true);
    await db.comics.update(item.id, { ...data, updatedAt: Date.now() } as any);
    setBusy(false);
    nav("/comic");
  }

  if (!item) return <div className="p-4">Hämtar…</div>;
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Redigera serietidning</h1>
      <ComicForm initial={item} onSubmit={onSubmit} busy={busy} />
    </section>
  );
}