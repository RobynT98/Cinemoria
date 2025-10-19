// src/components/game/GameCard.tsx
import { Link } from "react-router-dom";
import clsx from "classnames";

export type GameCardProps = {
  id?: number;
  title: string;
  platform?: string;
  year?: number;
  coverUrl?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  to?: string; // länk till detalj/editsida (valfri)
  className?: string;
};

export default function GameCard({
  id,
  title,
  platform,
  year,
  coverUrl,
  owned,
  digital,
  wishlisted,
  to,
  className,
}: GameCardProps) {
  const body = (
    <article
      className={clsx(
        "card p-3 flex gap-3 items-start",
        "hover:shadow-sm transition-shadow",
        className
      )}
    >
      <div className="w-12 h-16 rounded bg-ink-700/30 shrink-0 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-sand-300">
            Ingen bild
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{title}</div>
        <div className="text-sand-300 text-xs truncate">
          {[platform, year].filter(Boolean).join(" • ")}
        </div>

        <div className="mt-2 flex gap-1 flex-wrap">
          {owned && <span className="chip">Ägd</span>}
          {digital && <span className="chip">Digital</span>}
          {wishlisted && <span className="chip">Önskelista</span>}
        </div>
      </div>
    </article>
  );

  return to ? (
    <Link to={to} aria-label={title} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}