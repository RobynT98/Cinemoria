import { Link } from "react-router-dom";
import clsx from "classnames";
import { BookOpen } from "lucide-react";
import type { Comic } from "@/types";
import { labelComicFormat } from "@/types";

export type ComicCardProps = {
  id?: number;
  title: string;
  seriesTitle?: string;
  /** bakåtkomp – om äldre data använder `series`/`issue` */
  series?: string;
  issueNumber?: number;
  issue?: number;
  volume?: number;
  year?: number;
  coverUrl?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  format?: Comic["format"];
  /** Gör hela kortet klickbart om satt (t.ex. detalj-/edit-sida) */
  to?: string;
  className?: string;
};

export default function ComicCard({
  id,
  title,
  seriesTitle,
  series,
  issueNumber,
  issue,
  volume,
  year,
  coverUrl,
  owned,
  digital,
  wishlisted,
  format,
  to,
  className,
}: ComicCardProps) {
  const ser = (seriesTitle ?? series ?? "").trim();
  const num = typeof issueNumber === "number" ? issueNumber : issue;

  const metaParts = [
    ser ? ser : undefined,
    typeof volume === "number" ? `Vol. ${volume}` : undefined,
    typeof num === "number" ? `#${num}` : undefined,
    typeof year === "number" ? String(year) : undefined,
    format ? labelComicFormat(format) : undefined,
  ].filter(Boolean);

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
          <BookOpen className="opacity-70" />
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sand-300 text-xs truncate">
          {metaParts.join(" • ")}
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
            <Link to={`/comic/edit/${id}`} className="btn">Redigera</Link>
          )}
        </div>
      </div>
    </article>
  );

  return to ? (
    <Link to={to} aria-label={title} className="block no-underline hover:opacity-95">
      {body}
    </Link>
  ) : (
    body
  );
}