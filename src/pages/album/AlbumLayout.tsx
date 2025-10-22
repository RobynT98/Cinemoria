// src/layouts/album/AlbumLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import clsx from "classnames";
import { Home, Search, PlusCircle, Library } from "lucide-react";

export default function AlbumLayout() {
  return (
    // blå accent för musik
    <div className="scope-album min-h-full flex flex-col">
      <header
        className={clsx(
          "sticky top-0 z-20 border-b backdrop-blur-md",
          "bg-white/85 border-sky-200",
          "dark:bg-ink-900/70 dark:border-ink-700",
          "sepia:bg-[#f1f3f7]/85 sepia:border-[#cfd8e3]"
        )}
      >
        <div className="max-w-3xl mx-auto px-3 py-3">
          <h1 className="text-xl font-semibold">Musik</h1>
          <nav className="mt-2 flex gap-2 overflow-x-auto scrollbar-none">
            <Tab to="." label="Översikt" icon={<Home size={16} />} />
            <Tab to="search" label="Sök" icon={<Search size={16} />} />
            <Tab to="add" label="Lägg till" icon={<PlusCircle size={16} />} />
            <Tab to="collections" label="Listor" icon={<Library size={16} />} />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-3 py-4">
        <Outlet />
      </main>
    </div>
  );
}

function Tab({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={to === "."}
      className={({ isActive }) =>
        clsx(
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition",
          isActive
            ? "tab-active"
            : "border-sky-300 text-ink-700 hover:bg-sky-100 dark:border-ink-700 dark:text-sand-200 dark:hover:bg-ink-800 sepia:border-[#cfd8e3] sepia:hover:bg-[#e4e9f2]"
        )
      }
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}