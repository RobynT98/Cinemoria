import { Outlet } from "react-router-dom";
import SectionNav from "@/components/SectionNav";

export default function MovieHub() {
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Film</h1>
      <SectionNav base="/movie" />
      <Outlet />
    </section>
  );
}