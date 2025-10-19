import { NavLink, Outlet } from "react-router-dom";
import { Search, PlusCircle, Home } from "lucide-react";

export default function BookLayout() {
  return (
    <section className="p-0">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 border-b backdrop-blur
                      dark:bg-ink-900/80 dark:border-ink-700
                      sepia:bg-[#f3e8c7]/90 sepia:border-[#e7d3a8]">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Böcker</h1>
          <nav className="flex gap-2">
            <Tab to="/book" icon={<Home size={16} />} label="Översikt" end />
            <Tab to="/book/search" icon={<Search size={16} />} label="Sök" />
            <Tab to="/book/add" icon={<PlusCircle size={16} />} label="Lägg till" />
          </nav>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <Outlet />
      </div>
    </section>
  );
}

function Tab({ to, label, icon, end=false }: { to: string; label: string; icon: React.ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "chip no-underline " + (isActive ? "bg-accent-500 text-white" : "")
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}