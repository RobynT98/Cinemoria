import { Outlet } from "react-router-dom";
import SectionNav from "@/components/SectionNav";

export default function BookHub() {
  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Böcker</h1>
      <SectionNav base="/book" />
      <Outlet />
    </section>
  );
}