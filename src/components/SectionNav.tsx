import { NavLink } from "react-router-dom";
import clsx from "classnames";

export default function SectionNav({ base }: { base: "/movie" | "/book" | "/game" }) {
  const items = [
    { to: `${base}`, label: "Översikt" },
    { to: `${base}/search`, label: "Sök" },
    { to: `${base}/add`, label: "Lägg till" },
    ...(base === "/movie" ? [{ to: `${base}/collections`, label: "Samlingar" }] : []),
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
