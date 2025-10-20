// src/components/MovieDetailsDialog.tsx
import { type Movie } from "@/db";
import { Film, X } from "lucide-react";
import clsx from "classnames";

type Props = {
  open: boolean;
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieDetailsDialog({ open, movie, onClose }: Props) {
  if (!open || !movie) return null;

  const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
    value ? (
      <div className="mb-3">
        <div className="text-sand-300 text-xs">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={clsx(
          "absolute inset-x-0 bottom-0",
          "rounded-t-3xl bg-ink-900 text-sand-100",
          "max-h-[85vh] overflow-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 flex items-center gap-3">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-12 h-16 object-cover rounded-lg border border-ink-700/50"
            />
          ) : (
            <div className="w-12 h-16 grid place-items-center rounded-lg bg-ink-800">
              <Film className="opacity-70" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{movie.title}</div>
            {movie.year && <div className="text-sand-300 text-xs">{movie.year}</div>}
          </div>
          <button className="chip" onClick={onClose} aria-label="Stäng">
            <X className="w-4 h-4" /> Stäng
          </button>
        </div>

        {/* Chips */}
        <div className="px-3 pb-2 flex flex-wrap gap-2">
          {movie.owned && <span className="chip">Ägd</span>}
          {movie.digital && <span className="chip">Digital</span>}
          {movie.wishlisted && <span className="chip">Önskelista</span>}
          {movie.format && <span className="chip">{labelFormat(movie.format)}</span>}
          {movie.videoStandard && <span className="chip">{movie.videoStandard}</span>}
          {movie.region && movie.region !== "NONE" && <span className="chip">{movie.region}</span>}
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          <div className="text-sand-300 text-sm mb-2">Utgåva & teknik</div>
          <Row label="Utgåva" value={movie.edition} />
          <Row label="Utgåveår" value={movie.releaseYear} />
          <Row label="Cut" value={movie.cut} />
          <Row label="Ljudvariant" value={movie.audioVariant} />
          <Row label="Videostandard" value={movie.videoStandard} />
          <Row label="Region" value={movie.region} />
          <Row label="Format" value={movie.format} />

          <div className="text-sand-300 text-sm mt-4 mb-2">Plats</div>
          <Row label="Tjänst / Leverantör" value={movie.provider} />
          <Row label="Plats / Hylla" value={movie.location} />

          <div className="text-sand-300 text-sm mt-4 mb-2">Identifiering</div>
          <Row label="Streckkod (EAN/UPC)" value={movie.barcode} />

          <div className="text-sand-300 text-sm mt-4 mb-2">Anteckningar</div>
          <Row label="" value={movie.notes} />
        </div>
      </div>
    </div>
  );
}

function labelFormat(f?: Movie["format"]) {
  switch (f) {
    case "uhd":
      return "4K UHD";
    case "bluray":
      return "Blu-ray";
    case "dvd":
      return "DVD";
    case "digital":
      return "Digital";
    case "vhs":
      return "VHS";
    default:
      return "Övrigt";
  }
}