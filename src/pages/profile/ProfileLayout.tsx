// src/pages/profile/ProfileLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import clsx from "classnames";
import { Home, HelpCircle } from "lucide-react";

export default function ProfileLayout() {
  return (
    // Eget scope så vi kan styra accent och känsla separat
    <div className="scope-profile min-h-full flex flex-col">
      <header
        className={clsx(
          "sticky top-0 z-20 border-b backdrop-blur-md",
          "bg-white/85 border-sand-200",
          "dark:bg-ink-900/70 dark:border-ink-700",
          "sepia:bg-[#f7f1da]/85 sepia:border-[#e7d3a8]"
        )}
      >
        <div className="max-w-3xl mx-auto px-3 py-3">
          <h1 className="text-xl font-semibold">Profil & Inställningar</h1>
          <nav className="mt-2 flex gap-2 overflow-x-auto scrollbar-none">
            <Tab to="." label="Översikt" icon={<Home size={16} />} />
            {/* Instruktioner ligger utanför /profile, så vi länkar absolut */}
            <Tab to="/instructions" label="Instruktioner" icon={<HelpCircle size={16} />} absolute />
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
  absolute = false,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** när true länkar vi absolut (t.ex. /instructions) */
  absolute?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={!absolute && to === "."} // exakt /profile för Översikt
      className={({ isActive }) =>
        clsx(
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition",
          // egen accent via .tab-active -> var(--accent)
          isActive ? "tab-active"
          : "border-sand-300 text-ink-700 hover:bg-sand-200 dark:border-ink-700 dark:text-sand-200 dark:hover:bg-ink-800 sepia:border-[#d8c6a2] sepia:hover:bg-[#f3e8c7]"
        )
      }
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}