import { Link } from "react-router-dom";
import clsx from "classnames";
import { BookOpen } from "lucide-react";
import type { Comic } from "@/types";
import { labelComicFormat } from "@/types";

export type ComicCardProps = {
  id?: number;
  title: string;
  seriesTitle?: string;
  series?: string;       // legacy
  issueNumber?: number;
  issue?: number;        // legacy
  volume?: number;
  year?: number;
  coverUrl?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  format?: Comic["format"];
  to?: string;
  className?: string;
};

// Accept both <ComicCard comic={c}/> and <ComicCard {...c}/>
type ComicCardUnion = ComicCardProps | { comic: Comic };

export default function ComicCard(_props: ComicCardUnion) {
  const p: ComicCardProps =
    "comic" in _props
      ? {
          id: _props.comic.id,
          title: _props.comic.title,
          seriesTitle: _props.comic.seriesTitle,
          series: _props.comic.series,
          issueNumber: _props.comic.issueNumber,
          issue: _props.comic.issue,
          volume: _props.comic.volume,
          year: _props.comic.year,
          coverUrl: _props.comic.coverUrl,
          owned: _props.comic.owned,
          digital: _props.comic.digital,
          wishlisted: _props.comic.wishlisted,
          format: _props.comic.format,
          className: undefined,
          to: undefined,
        }
      : _props;

  const {
    id, title, seriesTitle, series, issueNumber, issue, volume, year,
    coverUrl, owned, digital, wishlisted, format, to, className,
  } = p;

  const ser = (seriesTitle ?? series ?? "").trim();
  const num = typeof issueNumber === "number" ? issueNumber : issue;

  const meta = [
    ser || undefined,
    typeof volume === "number" ? `Vol. ${volume}` : undefined,
    typeof num === "number" ? `#${num}` : undefined,
    typeof year === "number" ? String(year) : undefined,
    format ? labelComicFormat(format) : undefined,
  ].filter(Boolean).join(" • ");

  const body = (
    <article className={clsx("card p-3 flex gap-3 items-start", className)}>
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

      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sand-300 text-xs truncate">{meta}</div>

        <div className="mt-2 flex gap-2 flex-wrap">
          {owned && <span className="chip">Ägd</span>}
          {digital && <span className="chip">Digital</span>}
          {wishlisted && <span className="chip">Önskelista</span>}
        </div>

        <div className="mt-3 flex gap-2">
          {typeof id === "number" && <Link to={`/comic/edit/${id}`} className="btn">Redigera</Link>}
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