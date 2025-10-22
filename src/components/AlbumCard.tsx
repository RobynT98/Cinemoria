import { Link } from "react-router-dom";
import clsx from "classnames";
import { Disc3 } from "lucide-react";
import type { Album } from "@/types";
import { labelAlbumFormat } from "@/types";

export type AlbumCardProps = {
  id?: number;
  title: string;
  artist?: string;
  year?: number;
  coverUrl?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  format?: Album["format"];
  to?: string;
  className?: string;
};

// Accept both <AlbumCard album={a}/> and <AlbumCard {...a}/>
type AlbumCardUnion = AlbumCardProps | { album: Album };

export default function AlbumCard(_props: AlbumCardUnion) {
  const p: AlbumCardProps =
    "album" in _props
      ? {
          id: _props.album.id,
          title: _props.album.title,
          artist: _props.album.artist,
          year: _props.album.year,
          coverUrl: _props.album.coverUrl,
          owned: _props.album.owned,
          digital: _props.album.digital,
          wishlisted: _props.album.wishlisted,
          format: _props.album.format,
          className: undefined,
          to: undefined,
        }
      : _props;

  const { id, title, artist, year, coverUrl, owned, digital, wishlisted, format, to, className } = p;

  const meta = [artist?.trim() || undefined, year ? String(year) : undefined, format ? labelAlbumFormat(format) : undefined]
    .filter(Boolean)
    .join(" • ");

  const body = (
    <article className={clsx("card p-3 flex gap-3 items-start", className)}>
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-24 h-24 object-cover rounded-xl border border-ink-700/30"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-24 rounded-xl grid place-items-center bg-ink-700/40">
          <Disc3 className="opacity-70" />
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
          {typeof id === "number" && <Link to={`/album/edit/${id}`} className="btn">Redigera</Link>}
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