// src/pages/book/BookLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import clsx from "classnames";
import { Home, Search, PlusCircle } from "lucide-react";

export default function BookLayout() {
  return (
    <div className="min-h-full flex flex-col">
      {/* Topbar */}
      <header
        className={clsx(
          "sticky top-0 z-20 border-b backdrop-blur-md",
          // Ljus
          "bg-white/85 border-sand-200",
          // Mörk
          "dark:bg-ink-900/70 dark:border-ink-700",
          // Sepia
          "sepia:bg-[#f7f1da]/85 sepia:border-[#e7d3a8]"
        )}
      >
        <div className="max-w-3xl mx-auto px-3 py-3">
          <h1 className="text-xl font-semibold">Böcker</h1>
          <p className="text-sand-300 text-xs">Lägg till, sök och håll koll på din bokhylla.</p>

          {/* Undertabs (relativa länkar) */}
          <nav className="mt-3 -mb-[1px] flex gap-2 overflow-x-auto scrollbar-none">
            <SubTab to="" icon={<Home size={16} />}>Översikt</SubTab>
            <SubTab to="search" icon={<Search size={16} />}>Sök</SubTab>
            <SubTab to="add" icon={<PlusCircle size={16} />}>Lägg till</SubTab>
          </nav>
        </div>
      </header>

      {/* Innehåll */}
      <main className="flex-1 max-w-3xl mx-auto px-3 py-4">
        <Outlet />
      </main>
    </div>
  );
}

function SubTab({
  to,
  children,
  icon,
}: {
  to: string; // relativ rutt ("" för index)
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        clsx(
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition",
          isActive
            ? "bg-accent-500 text-white border-accent-500"
            : "border-sand-300 text-ink-700 hover:bg-sand-200 dark:border-ink-700 dark:text-sand-200 dark:hover:bg-ink-800 sepia:border-[#d8c6a2] sepia:hover:bg-[#f3e8c7]"
        )
      }
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}