import { Outlet } from "react-router-dom";
import SectionNav from "@/components/SectionNav";

export default function GameHub() {
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Spel</h1>
      <SectionNav base="/game" />
      <Outlet />
    </section>
  );
}