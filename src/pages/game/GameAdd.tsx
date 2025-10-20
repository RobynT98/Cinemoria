import { useNavigate } from "react-router-dom";
import GameForm from "@/components/game/GameForm";
import { addGame } from "@/db";
import type { Game } from "@/db";

export default function GameAdd() {
  const navigate = useNavigate();

  async function handleSubmit(data: Game) {
    await addGame(data);
    alert("Spelet sparat!");
    navigate("/game");
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till spel</h1>
      <GameForm submitLabel="Spara spel" onSubmit={handleSubmit} />
    </section>
  );
}