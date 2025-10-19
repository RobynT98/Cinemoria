// src/pages/game/GameEdit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGame, updateGame, type Game } from "@/db";
import GameForm from "@/components/game/GameForm";

export default function GameEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const num = Number(id);
    if (!Number.isFinite(num)) {
      setNotFound(true);
      return;
    }
    getGame(num).then((g) => {
      if (!g) setNotFound(true);
      else setGame(g);
    });
  }, [id]);

  if (notFound) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Hittar inte spelet</h1>
        <p className="text-sand-300">Spelet verkar inte finnas. Det kan ha tagits bort.</p>
      </section>
    );
  }

  if (!game) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-semibold mb-3">Redigerar…</h1>
        <div className="card p-6">Laddar spel…</div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Redigera spel</h1>
      <GameForm
        submitLabel="Spara ändringar"
        initial={game}
        onSubmit={async (data) => {
          await updateGame(game.id!, data);
          alert("Uppdaterad!");
          navigate(-1);
        }}
      />
    </section>
  );
}