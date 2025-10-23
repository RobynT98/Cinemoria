// src/components/BottomNav.tsx
import { NavLink } from "react-router-dom";
import {
  Home, Library, User, BookOpen, Gamepad2, Disc3, PanelsTopLeft,
} from "lucide-react";
import clsx from "classnames";
import { useTranslation } from "react-i18next";

// Liten helper-komponent
function NavItem({ to, k, icon }: { to: string; k: string; icon: React.ReactNode; }) {
  const { t } = useTranslation();
  const label = t(k);

  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center py-2 text-[10px] gap-1 transition-colors",
          isActive
            ? "text-ink-900 dark:text-sand-200 sepia:text-[#3c2f1b]"
            : "text-ink-600 hover:text-ink-900 dark:text-sand-400 dark:hover:text-sand-200 sepia:text-[#6b5637] sepia:hover:text-[#3c2f1b]"
        )
      }
      end={to === "/"}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}


export default function BottomNav() {
  return (
    <nav
      className={clsx(
        "fixed bottom-0 inset-x-0 border-t backdrop-blur",
        "bg-white/90 border-sand-200",
        "dark:bg-ink-800/80 dark:border-ink-700",
        "sepia:bg-[#f3e8c7]/90 sepia:border-[#e7d3a8]"
      )}
    >
      <div className="max-w-3xl mx-auto grid grid-cols-7">
        <NavItem to="/"        k="nav.home"    icon={<Home size={22} />} />
        <NavItem to="/movie"   k="nav.movies"  icon={<Library size={22} />} />
        <NavItem to="/game"    k="nav.games"   icon={<Gamepad2 size={22} />} />
        <NavItem to="/book"    k="nav.books"   icon={<BookOpen size={22} />} />
        <NavItem to="/album"   k="nav.music"   icon={<Disc3 size={22} />} />
        <NavItem to="/comic"   k="nav.comics"  icon={<PanelsTopLeft size={22} />} />
        <NavItem to="/profile" k="nav.profile" icon={<User size={22} />} />
      </div>
    </nav>
  );
}
