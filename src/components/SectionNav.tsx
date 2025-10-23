import { NavLink } from "react-router-dom";
import clsx from "classnames";
import { useTranslation } from "react-i18next";

export default function SectionNav({ base }: { base: "/movie" | "/book" | "/game" | "/album" | "/comic" }) {
  const { t } = useTranslation();

  const items = [
    { to: `${base}`, label: t("sectionNav.overview") },
    { to: `${base}/search`, label: t("sectionNav.search") },
    { to: `${base}/add`, label: t("sectionNav.add") },
    ...(base === "/movie" ? [{ to: `${base}/collections`, label: t("sectionNav.collections") }] : []),
    ...(base === "/book"  ? [{ to: `${base}/collections`, label: t("sectionNav.collections") }] : []),
    ...(base === "/game"  ? [{ to: `${base}/collections`, label: t("sectionNav.collections") }] : []),
    ...(base === "/album" ? [{ to: `${base}/collections`, label: t("sectionNav.collections") }] : []),
    ...(base === "/comic" ? [{ to: `${base}/collections`, label: t("sectionNav.collections") }] : []),
  ];

  return (
    <div className="card p-2 flex gap-2 flex-wrap">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end
          className={({ isActive }) =>
            clsx(
              "chip no-underline",
              isActive ? "bg-accent-500 text-white border-transparent" : ""
            )
          }
        >
          {i.label}
        </NavLink>
      ))}
    </div>
  );
}