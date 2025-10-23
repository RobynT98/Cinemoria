import { NavLink, Route, Routes } from "react-router-dom";
import {
  Home,
  Library,
  User,
  BookOpen,
  Gamepad2,
  Disc3,
  PanelsTopLeft,
} from "lucide-react";
import { Suspense, lazy } from "react";
import clsx from "classnames";
import { useTranslation } from "react-i18next";

/* Home */
const HomeLayout = lazy(() => import("./pages/home/HomeLayout"));
const HomePage = lazy(() => import("./pages/home/HomePage"));
const InstructionsPage = lazy(() => import("./pages/home/InstructionsPage"));

/* Profile */
const ProfileLayout = lazy(() => import("./pages/profile/ProfileLayout"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

/* Movie */
const MovieLayout = lazy(() => import("./pages/movie/MovieLayout"));
const MovieHome = lazy(() => import("./pages/movie/MovieHome"));
const MovieSearch = lazy(() => import("./pages/movie/SearchPage"));
const MovieAdd = lazy(() => import("./pages/movie/AddPage"));
const MovieCollections = lazy(() => import("./pages/movie/CollectionsPage"));
const MovieListDetail = lazy(() => import("./pages/movie/ListDetailPage"));
const MovieEdit = lazy(() => import("./pages/movie/EditPage"));

/* Book */
const BookLayout = lazy(() => import("./pages/book/BookLayout"));
const BookHome = lazy(() => import("./pages/book/BookHome"));
const BookSearch = lazy(() => import("./pages/book/BookSearch"));
const BookAdd = lazy(() => import("./pages/book/BookAdd"));
const BookCollections = lazy(() => import("./pages/book/BookCollectionsPage"));
const BookListDetail = lazy(() => import("./pages/book/BookListDetailPage"));
const BookEdit = lazy(() => import("./pages/book/BookEdit"));

/* Game */
const GameLayout = lazy(() => import("./pages/game/GameLayout"));
const GameHome = lazy(() => import("./pages/game/GameHome"));
const GameSearch = lazy(() => import("./pages/game/GameSearch"));
const GameAdd = lazy(() => import("./pages/game/GameAdd"));
const GameCollections = lazy(() => import("./pages/game/GameCollectionsPage"));
const GameListDetail = lazy(() => import("./pages/game/GameListDetailPage"));
const GameEdit = lazy(() => import("./pages/game/EditPage"));

/* Music (Albums) */
const AlbumLayout = lazy(() => import("./pages/album/AlbumLayout"));
const AlbumHome = lazy(() => import("./pages/album/AlbumHome"));
const AlbumSearch = lazy(() => import("./pages/album/AlbumSearch"));
const AlbumAdd = lazy(() => import("./pages/album/AlbumAdd"));
const AlbumCollections = lazy(() => import("./pages/album/AlbumCollectionsPage"));
const AlbumListDetail = lazy(() => import("./pages/album/AlbumListDetailPage"));
const AlbumEdit = lazy(() => import("./pages/album/EditPage"));

/* Comics (Serietidningar) */
const ComicLayout = lazy(() => import("./pages/comic/ComicLayout"));
const ComicHome = lazy(() => import("./pages/comic/ComicHome"));
const ComicSearch = lazy(() => import("./pages/comic/SearchPage"));
const ComicAdd = lazy(() => import("./pages/comic/AddPage"));
const ComicCollections = lazy(() => import("./pages/comic/CollectionsPage"));
const ComicListDetail = lazy(() => import("./pages/comic/ListDetailPage"));
const ComicEdit = lazy(() => import("./pages/comic/EditPage"));

export default function App() {
  const { t } = useTranslation();

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
        <Suspense fallback={<div className="p-4">{t("loading", { defaultValue: "Laddar..." })}</div>}>
          <Routes>
            {/* HEM */}
            <Route path="/" element={<HomeLayout />}>
              <Route index element={<HomePage />} />
              <Route path="instructions" element={<InstructionsPage />} />
            </Route>

            {/* FILM */}
            <Route path="/movie" element={<MovieLayout />}>
              <Route index element={<MovieHome />} />
              <Route path="search" element={<MovieSearch />} />
              <Route path="add" element={<MovieAdd />} />
              <Route path="collections" element={<MovieCollections />} />
              <Route path="collections/:id" element={<MovieListDetail />} />
              <Route path="edit/:id" element={<MovieEdit />} />
            </Route>

            {/* BÖCKER */}
            <Route path="/book" element={<BookLayout />}>
              <Route index element={<BookHome />} />
              <Route path="search" element={<BookSearch />} />
              <Route path="add" element={<BookAdd />} />
              <Route path="collections" element={<BookCollections />} />
              <Route path="collections/:id" element={<BookListDetail />} />
              <Route path="edit/:id" element={<BookEdit />} />
            </Route>

            {/* SPEL */}
            <Route path="/game" element={<GameLayout />}>
              <Route index element={<GameHome />} />
              <Route path="search" element={<GameSearch />} />
              <Route path="add" element={<GameAdd />} />
              <Route path="collections" element={<GameCollections />} />
              <Route path="collections/:id" element={<GameListDetail />} />
              <Route path="edit/:id" element={<GameEdit />} />
            </Route>

            {/* MUSIK */}
            <Route path="/album" element={<AlbumLayout />}>
              <Route index element={<AlbumHome />} />
              <Route path="search" element={<AlbumSearch />} />
              <Route path="add" element={<AlbumAdd />} />
              <Route path="collections" element={<AlbumCollections />} />
              <Route path="collections/:id" element={<AlbumListDetail />} />
              <Route path="edit/:id" element={<AlbumEdit />} />
            </Route>

            {/* SERIER */}
            <Route path="/comic" element={<ComicLayout />}>
              <Route index element={<ComicHome />} />
              <Route path="search" element={<ComicSearch />} />
              <Route path="add" element={<ComicAdd />} />
              <Route path="collections" element={<ComicCollections />} />
              <Route path="collections/:id" element={<ComicListDetail />} />
              <Route path="edit/:id" element={<ComicEdit />} />
            </Route>

            {/* PROFIL */}
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>

      {/* Bottennavigation - INBYGGD */}
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
    </div>
  );
}

function NavItem({
  to,
  k,
  icon,
}: {
  to: string;
  k: string;
  icon: React.ReactNode;
}) {
  const { t } = useTranslation();
  // ANVÄND t(k) OCH LITA PÅ ATT JSON-FIXARNA LÖSER UPPSLAGNINGEN
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
