// src/components/SectionNav.tsx
import { NavLink } from "react-router-dom";
import clsx from "classnames";
import { useTranslation } from "react-i18next"; // <-- Ny import

type BasePath = "/movie" | "/book" | "/game" | "/album" | "/comic";

export default function SectionNav({ base }: { base: BasePath }) {
  const { t } = useTranslation(); // <-- Använd useTranslation

  // Definiera nav-länkarna med i18n-nycklar
  const mainItems = [
    { to: `${base}`, key: "sectionNav.overview", default: "Översikt" },
    { to: `${base}/search`, key: "sectionNav.search", default: "Sök" },
    { to: `${base}/add`, key: "sectionNav.add", default: "Lägg till" },
  ];

  // Skapa "Samlingar" länken villkorligt
  const collectionsItem = { 
      to: `${base}/collections`, 
      key: "sectionNav.collections", 
      default: "Samlingar" 
  };
  
  // Lista över alla sektioner som har en "CollectionsPage"
  const sectionsWithCollections = ["/movie", "/book", "/game", "/album", "/comic"];
  
  // Kombinera huvudlänkar med Samlingar-länken, om basvägen matchar
  const items = [
      ...mainItems,
      ...(sectionsWithCollections.includes(base) ? [collectionsItem] : [])
  ];

  return (
    <div className="card p-2 flex gap-2 flex-wrap">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          // Viktigt: 'end' behövs på Overview för att inte markera Search/Add/etc. som aktiva
          end={i.key === "sectionNav.overview"} 
          className={({ isActive }) =>
            clsx(
              "chip no-underline",
              isActive ? "bg-accent-500 text-white border-transparent" : ""
            )
          }
        >
          {t(i.key, i.default)}
        </NavLink>
      ))}
    </div>
  );
}
