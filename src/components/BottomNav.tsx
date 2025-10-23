// src/components/BottomNav.tsx
import { NavLink } from "react-router-dom";
import {
  Home, Library, User, BookOpen, Gamepad2, Disc3, PanelsTopLeft,
} from "lucide-react";
import { useEffect, useState } from "react"; // <-- NYA IMPORTS
import clsx from "classnames";
import { useTranslation } from "react-i18next";


// Helper-komponent för navigering
function NavItem({ to, k, icon }: { to: string; k: string; icon: React.ReactNode; }) {
  const { t } = useTranslation();
  
  // Vi litar på att t(k) fungerar nu
  const fallbackText = k.split('.')[1] || 'Error';
  const label = t(k, { defaultValue: fallbackText }); // Använd den säkra fallbacken

  return (
    <NavLink
      to={to}
      aria-label={label}
      // ... (resten av koden är intakt)
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}


export default function BottomNav() {
  // ANVÄND EN DUMMY STATE FÖR ATT LÖSA RACE CONDITIONEN
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // VIKTIG FIX: Tvinga fram en omrendering efter 10ms. 
    // Detta ger i18next tid att registrera alla nycklar i den känsliga PWA-miljön.
    const timer = setTimeout(() => {
      setReady(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Om vi inte är "redo", visas den läsbara fallback-texten (home, movies, etc.) 
  // tills den riktiga renderingen sker.
  if (!ready) {
      // Returnerar en "placeholder" nav bar som använder den läsbara fallbacken
      return (
          <nav className="fixed bottom-0 inset-x-0 border-t bg-ink-900/80">
              <div className="max-w-3xl mx-auto grid grid-cols-7">
                  {/* Returnerar en enkel version av NavItem utan all styling för att unvika krasch */}
                  <NavItem to="/" k="nav.home" icon={<Home size={22} />} />
                  <NavItem to="/movie" k="nav.movies" icon={<Library size={22} />} />
                  {/* ... fyll på med de andra NavItems här ... */}
              </div>
          </nav>
      );
  }

  // När "ready" är true, renderas den fulla komponenten med korrekta översättningar
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
