// src/App.tsx
import { NavLink, Route, Routes } from "react-router-dom";
import { Home, Library, User, BookOpen, Gamepad2 } from "lucide-react";
import { Suspense, lazy } from "react";
import clsx from "classnames";

/* Home */
const HomePage = lazy(() => import("./pages/home/HomePage"));

/* Profile */
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage")); // flytta filen hit, eller ändra sökvägen tillbaka

/* Movie (återanvänd dina befintliga sidor) */
const MovieHub = lazy(() => import("./pages/movie/MovieHub"));
const MovieSearch = lazy(() => import("./pages/movie/SearchPage"));      // flytta filen eller re-exportera
const MovieAdd = lazy(() => import("./pages/movie/AddPage"));
const MovieCollections = lazy(() => import("./pages/movie/CollectionsPage"));
const MovieListDetail = lazy(() => import("./pages/movie/ListDetailPage"));
const MovieEdit = lazy(() => import("./pages/movie/EditPage"));

/* Book (placeholders) */
const BookHub = lazy(() => import("./pages/book/BookHub"));
const BookHome = lazy(() => import("./pages/book/BookHome"));
const BookSearch = lazy(() => import("./pages/book/BookSearch"));
const BookAdd = lazy(() => import("./pages/book/BookAdd"));

/* Game (placeholders) */
const GameHub = lazy(() => import("./pages/game/GameHub"));
const GameHome = lazy(() => import("./pages/game/GameHome"));
const GameSearch = lazy(() => import("./pages/game/GameSearch"));
const GameAdd = lazy(() => import("./pages/game/GameAdd"));

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
        <Suspense fallback={<div className="p-4">Laddar…</div>}>
          <Routes>
            {/* Hem */}
            <Route path="/" element={<HomePage />} />

            {/* Film – hub + undersidor */}
            <Route path="/movie" element={<MovieHub />}>
              <Route index element={<MovieSearch />} />
              <Route path="search" element={<MovieSearch />} />
              <Route path="add" element={<MovieAdd />} />
              <Route path="collections" element={<MovieCollections />} />
              <Route path="collections/:id" element={<MovieListDetail />} />
              <Route path="edit/:id" element={<MovieEdit />} />
            </Route>

            {/* Böcker – hub + undersidor */}
            <Route path="/book" element={<BookHub />}>
              <Route index element={<BookHome />} />
              <Route path="search" element={<BookSearch />} />
              <Route path="add" element={<BookAdd />} />
            </Route>

            {/* Spel – hub + undersidor */}
            <Route path="/game" element={<GameHub />}>
              <Route index element={<GameHome />} />
              <Route path="search" element={<GameSearch />} />
              <Route path="add" element={<GameAdd />} />
            </Route>

            {/* Profil */}
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
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
      end={to === "/"} // gör att 'Hem' bara är aktivt exakt på "/"
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}