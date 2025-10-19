import { NavLink, Outlet } from "react-router-dom";
import clsx from "classnames";
import { Home, Search, PlusCircle, Library } from "lucide-react";

export default function GameLayout() {
  return (
    // blå accent
    <div className="scope-game min-h-full flex flex-col">
      <header
        className={clsx(
          "sticky top-0 z-20 border-b backdrop-blur-md",
          "bg-white/85 border-sand-200",
          "dark:bg-ink-900/70 dark:border-ink-700",
          "sepia:bg-[#f7f1da]/85 sepia:border-[#e7d3a8]"
        )}
      >
        <div className="max-w-3xl mx-auto px-3 py-3">
          <h1 className="text-xl font-semibold">Spel</h1>
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
  to, label, icon,
}: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "."}
      className={({ isActive }) =>
        clsx(
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition",
          isActive
            ? "tab-active"
            : "border-sand-300 text-ink-700 hover:bg-sand-200 dark:border-ink-700 dark:text-sand-200 dark:hover:bg-ink-800 sepia:border-[#d8c6a2] sepia:hover:bg-[#f3e8c7]"
        )
      }
      aria-label={label}
    >
      {icon}<span>{label}</span>
    </NavLink>
  );
}