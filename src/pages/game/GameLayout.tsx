import { NavLink, Outlet } from "react-router-dom";
import { Gamepad2, Search, PlusCircle, Library } from "lucide-react";
import clsx from "classnames";

export default function GameLayout() {
  return (
    <section className="p-0">
      {/* Topbar */}
      <header
        className={clsx(
          "sticky top-0 z-10 border-b backdrop-blur px-4 py-3",
          // Ljus
          "bg-white/80 border-sand-200",
          // Mörk
          "dark:bg-ink-800/70 dark:border-ink-700",
          // Sepia
          "sepia:bg-[#f3e8c7]/80 sepia:border-[#e7d3a8]"
        )}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="opacity-80" size={20} />
            <h1 className="text-xl font-semibold">Spel</h1>
          </div>

          {/* Undertabs */}
          <nav className="flex items-center gap-1 text-sm">
            <Tab to="" label="Översikt" end />
            <Tab to="search" label="Sök" />
            <Tab to="add" label="Lägg till" />
            <Tab to="collections" label="Listor" />
          </nav>
        </div>
      </header>

      {/* Innehåll */}
      <main className="px-4 pt-4 pb-6 max-w-3xl mx-auto">
        <Outlet />
      </main>
    </section>
  );
}

function Tab({
  to,
  label,
  end,
}: {
  to: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          "px-3 py-2 rounded-xl transition-colors",
          isActive
            ? "bg-sand-200 text-ink-900 dark:bg-ink-700 dark:text-sand-100 sepia:bg-[#e8d6a4] sepia:text-[#3c2f1b]"
            : "text-ink-600 hover:text-ink-900 dark:text-sand-400 dark:hover:text-sand-100 sepia:text-[#6b5637] sepia:hover:text-[#3c2f1b]"
        )
      }
    >
      {label}
    </NavLink>
  );
}