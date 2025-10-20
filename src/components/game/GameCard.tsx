import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
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
  /** Gör hela kortet klickbart om satt (t.ex. till detalj- eller edit-sida) */
  to?: string;
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
    <article className={clsx("card p-3 flex gap-3 items-start", className)}>
      {/* Omslag */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-24 h-32 object-cover rounded-xl border border-ink-700/30"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-32 rounded-xl grid place-items-center bg-ink-700/40">
          <Gamepad2 className="opacity-70" />
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sand-300 text-xs truncate">
          {[platform, year].filter(Boolean).join(" • ")}
        </div>

        {/* Chips */}
        <div className="mt-2 flex gap-2 flex-wrap">
          {owned && <span className="chip">Ägd</span>}
          {digital && <span className="chip">Digital</span>}
          {wishlisted && <span className="chip">Önskelista</span>}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {typeof id === "number" && (
            <Link to={`/game/edit/${id}`} className="btn">Redigera</Link>
          )}
        </div>
      </div>
    </article>
  );

  return to ? (
    <Link to={to} aria-label={title} className="block no-underline hover:opacity-95">
      {body}
    </Link>
  ) : body;
}