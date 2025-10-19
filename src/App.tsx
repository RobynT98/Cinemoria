import { NavLink, Route, Routes } from "react-router-dom";
import { Home, Library, User, BookOpen, Gamepad2 } from "lucide-react";
import clsx from "classnames";

// Huvudsidor
import HomePage from "./pages/home/HomePage";
import ProfilePage from "./pages/ProfilePage";

// Film – återanvänd dina befintliga sidor
import MovieHub from "./pages/movie/MovieHub";
import SearchPage from "./pages/SearchPage";
import AddPage from "./pages/AddPage";
import CollectionsPage from "./pages/CollectionsPage";
import ListDetailPage from "./pages/ListDetailPage";
import EditPage from "./pages/EditPage";

// Böcker (nya placeholders)
import BookHub from "./pages/book/BookHub";
import BookHome from "./pages/book/BookHome";
import BookSearch from "./pages/book/BookSearch";
import BookAdd from "./pages/book/BookAdd";

// Spel (nya placeholders)
import GameHub from "./pages/game/GameHub";
import GameHome from "./pages/game/GameHome";
import GameSearch from "./pages/game/GameSearch";
import GameAdd from "./pages/game/GameAdd";

export default function App() {
  return (
    <div
      className={clsx(
        "min-h-full",
        "bg-white text-ink-800",
        "dark:bg-ink-900 dark:text-sand-100",
        "sepia:bg-[#f7f1da] sepia:text-[#3c2f1b]"
      )}
    >
      <main className="pb-20 max-w-3xl mx-auto px-3">
        <Routes>
          {/* Hem */}
          <Route path="/" element={<HomePage />} />

          {/* Film – hub med undersidor */}
          <Route path="/movie" element={<MovieHub />}>
            <Route index element={<SearchPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="add" element={<AddPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="collections/:id" element={<ListDetailPage />} />
            <Route path="edit/:id" element={<EditPage />} />
          </Route>

          {/* Böcker – hub med undersidor (placeholder) */}
          <Route path="/book" element={<BookHub />}>
            <Route index element={<BookHome />} />
            <Route path="search" element={<BookSearch />} />
            <Route path="add" element={<BookAdd />} />
          </Route>

          {/* Spel – hub med undersidor (placeholder) */}
          <Route path="/game" element={<GameHub />}>
            <Route index element={<GameHome />} />
            <Route path="search" element={<GameSearch />} />
            <Route path="add" element={<GameAdd />} />
          </Route>

          {/* Profil */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* Bottennavigation – huvudflikar */}
      <nav
        className={clsx(
          "fixed bottom-0 inset-x-0 border-t backdrop-blur",
          "bg-white/90 border-sand-200",
          "dark:bg-ink-800/80 dark:border-ink-700",
          "sepia:bg-[#f3e8c7]/90 sepia:border-[#e7d3a8]"
        )}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-5">
          <NavItem to="/" label="Hem" icon={<Home size={22} />} />
          <NavItem to="/movie" label="Film" icon={<Library size={22} />} />
          <NavItem to="/game" label="Spel" icon={<Gamepad2 size={22} />} />
          <NavItem to="/book" label="Böcker" icon={<BookOpen size={22} />} />
          <NavItem to="/profile" label="Profil" icon={<User size={22} />} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
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
      aria-label={label}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center py-2 text-xs gap-1 transition-colors",
          isActive
            ? "text-ink-900 dark:text-sand-200 sepia:text-[#3c2f1b]"
            : "text-ink-600 hover:text-ink-900 dark:text-sand-400 dark:hover:text-sand-200 sepia:text-[#6b5637] sepia:hover:text-[#3c2f1b]"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}