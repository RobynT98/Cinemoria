import { NavLink, Route, Routes } from "react-router-dom";
import { Home, PlusCircle, Search, Library, User } from "lucide-react";
import { Suspense, lazy } from "react";
import clsx from "classnames";

const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AddPage = lazy(() => import("./pages/AddPage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));
const ListDetailPage = lazy(() => import("./pages/ListDetailPage")); // ⬅️ NY
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditPage = lazy(() => import("./pages/EditPage"));

export default function App() {
  return (
    <div className="min-h-full bg-white text-ink-800 dark:bg-ink-900 dark:text-sand-100">
      <main className="pb-20 max-w-3xl mx-auto px-3">
        <Suspense fallback={<div className="p-4">Laddar…</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:id" element={<ListDetailPage />} /> {/* ⬅️ NY */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit/:id" element={<EditPage />} />
          </Routes>
        </Suspense>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white/90 border-t border-sand-200 backdrop-blur dark:bg-ink-800/80 dark:border-ink-700">
        <div className="max-w-3xl mx-auto grid grid-cols-5">
          <NavItem to="/" label="Hem" icon={<Home size={22} />} />
          <NavItem to="/search" label="Sök" icon={<Search size={22} />} />
          <NavItem to="/add" label="Lägg till" icon={<PlusCircle size={22} />} />
          <NavItem to="/collections" label="Samlingar" icon={<Library size={22} />} />
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
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center py-2 text-xs gap-1",
          isActive
            ? "text-ink-900 dark:text-sand-200"
            : "text-ink-600 hover:text-ink-900 dark:text-sand-400 dark:hover:text-sand-200"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}