// src/pages/game/GameAdd.tsx
import GameForm from "@/components/game/GameForm";
import { addGame } from "@/db";

export default function GameAdd() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Lägg till spel</h1>
      <GameForm
        submitLabel="Spara spel"
        onSubmit={async (data) => {
          await addGame(data);
          alert("Sparat!");
        }}
      />
    </section>
  );
}