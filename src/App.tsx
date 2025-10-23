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

/* Navigation */
const BottomNav = lazy(() => import("./components/BottomNav")); // <-- Isolerad navigering

/* Home */
const HomeLayout = lazy(() => import("./pages/home/HomeLayout"));
const HomePage = lazy(() => import("./pages/home/HomePage"));
const InstructionsPage = lazy(() => import("./pages/home/InstructionsPage"));

/* Profile */
const ProfileLayout = lazy(() => import("./pages/profile/ProfileLayout"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

/* Movie (Exakt matchning mot filnamn) */
const MovieLayout = lazy(() => import("./pages/movie/MovieLayout"));
const MovieHome = lazy(() => import("./pages/movie/MovieHome"));
const MovieSearch = lazy(() => import("./pages/movie/SearchPage"));
const MovieAdd = lazy(() => import("./pages/movie/AddPage"));
const MovieCollections = lazy(() => import("./pages/movie/CollectionsPage"));
const MovieListDetail = lazy(() => import("./pages/movie/ListDetailPage")); // ListDetailPage.tsx
const MovieEdit = lazy(() => import("./pages/movie/EditPage")); // EditPage.tsx

/* Book (Exakt matchning mot filnamn) */
const BookLayout = lazy(() => import("./pages/book/BookLayout"));
const BookHome = lazy(() => import("./pages/book/BookHome"));
const BookSearch = lazy(() => import("./pages/book/BookSearch"));
const BookAdd = lazy(() => import("./pages/book/BookAdd"));
const BookCollections = lazy(() => import("./pages/book/BookCollectionsPage"));
const BookListDetail = lazy(() => import("./pages/book/BookListDetailPage")); // BookListDetailPage.tsx
const BookEdit = lazy(() => import("./pages/book/BookEdit")); // BookEdit.tsx

/* Game (Exakt matchning mot filnamn) */
const GameLayout = lazy(() => import("./pages/game/GameLayout"));
const GameHome = lazy(() => import("./pages/game/GameHome"));
const GameSearch = lazy(() => import("./pages/game/GameSearch"));
const GameAdd = lazy(() => import("./pages/game/GameAdd"));
const GameCollections = lazy(() => import("./pages/game/GameCollectionsPage"));
const GameListDetail = lazy(() => import("./pages/game/GameListDetailPage")); // GameListDetailPage.tsx
const GameEdit = lazy(() => import("./pages/game/GameEdit")); // GameEdit.tsx

/* Music (Albums) (Exakt matchning mot filnamn) */
const AlbumLayout = lazy(() => import("./pages/album/AlbumLayout"));
const AlbumHome = lazy(() => import("./pages/album/AlbumHome"));
const AlbumSearch = lazy(() => import("./pages/album/AlbumSearch"));
const AlbumAdd = lazy(() => import("./pages/album/AlbumAdd")); // AlbumAdd.tsx
const AlbumCollections = lazy(() => import("./pages/album/AlbumCollectionsPage"));
const AlbumListDetail = lazy(() => import("./pages/album/AlbumListDetailPage")); // AlbumListDetailPage.tsx
const AlbumEdit = lazy(() => import("./pages/album/AlbumEdit")); // AlbumEdit.tsx

/* Comics (Serietidningar) (Exakt matchning mot filnamn) */
const ComicLayout = lazy(() => import("./pages/comic/ComicLayout"));
const ComicHome = lazy(() => import("./pages/comic/ComicHome"));
const ComicSearch = lazy(() => import("./pages/comic/ComicSearch"));
const ComicAdd = lazy(() => import("./pages/comic/ComicAdd")); // ComicAdd.tsx
const ComicCollections = lazy(() => import("./pages/comic/ComicCollectionsPage"));
const ComicListDetail = lazy(() => import("./pages/comic/ComicListDetailPage")); // ComicListDetailPage.tsx
const ComicEdit = lazy(() => import("./pages/comic/ComicEdit")); // ComicEdit.tsx

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

      {/* Bottennavigation - Isolerad och Lazy-laddad */}
      <Suspense fallback={null}> 
        <BottomNav />
      </Suspense>
    </div>
  );
}

