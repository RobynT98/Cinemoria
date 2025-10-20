import { useEffect } from "react";
import type { Movie } from "@/db";

type Props = {
  open: boolean;
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieDetailsDialog({ open, movie, onClose }: Props) {
  // Stäng på ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !movie) return null;

  const {
    title,
    year,
    posterUrl,
    genres,
    owned,
    digital,
    wishlisted,
    format,
    videoStandard,
    region,
    edition,
    releaseYear,
    cut,
    audioVariant,
    location,
    provider,
    barcode,
    trailerUrl,
    seen,
    rating,
    notes,
  } = movie;

  const chips: string[] = [];
  if (owned) chips.push("Ägd");
  if (wishlisted) chips.push("Önskelista");
  if (digital) chips.push("Digital");
  if (format) chips.push(format.toUpperCase());
  if (videoStandard) chips.push(videoStandard);
  if (region) chips.push(region);
  if (seen) chips.push("Sedd");
  if (rating != null) chips.push(`Betyg: ${rating}`);

  return (
    <div
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-2xl
                   rounded-t-2xl md:rounded-2xl overflow-hidden
                   bg-white dark:bg-ink-800 sepia:bg-[#f7f1da]
                   shadow-2xl"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-start gap-3">
          <div className="w-16 h-24 rounded-md overflow-hidden bg-black/10 shrink-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {title} {year ? <span className="opacity-70">({year})</span> : null}
            </h2>
            {genres?.length ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {genres.map((g) => (
                  <span key={g} className="chip">{g}</span>
                ))}
              </div>
            ) : null}
          </div>
          <button
            className="chip shrink-0"
            onClick={onClose}
            aria-label="Stäng"
          >
            Stäng
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(92vh - 64px)" }}>
          {/* Status-chips */}
          {chips.length ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
          ) : null}

          {/* Utgåva / teknik */}
          <Section title="Utgåva & teknik">
            <Grid>
              <Field label="Utgåva" value={edition} />
              <Field label="Utgåveår" value={releaseYear} />
              <Field label="Cut" value={cut} />
              <Field label="Ljudvariant" value={audioVariant} />
              <Field label="Videostandard" value={videoStandard} />
              <Field label="Region" value={region} />
              <Field label="Format" value={format} />
            </Grid>
          </Section>

          {/* Plats / leverantör */}
          <Section title="Plats">
            <Grid>
              <Field label="Plats / Hylla" value={location} />
              <Field label="Tjänst / Leverantör" value={provider} />
            </Grid>
          </Section>

          {/* Länkar / id */}
          <Section title="Identifiering">
            <Grid>
              <Field label="Streckkod (EAN/UPC)" value={barcode} mono />
              <Field
                label="Trailer"
                value={
                  trailerUrl ? (
                    <a
                      href={trailerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Öppna trailer
                    </a>
                  ) : ""
                }
              />
            </Grid>
          </Section>

          {/* Anteckningar */}
          {notes ? (
            <Section title="Anteckningar">
              <p className="whitespace-pre-wrap text-sm opacity-90">{notes}</p>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small helpers ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode | string | number | undefined | null;
  mono?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="text-sm">
      <div className="opacity-60">{label}</div>
      <div className={mono ? "font-mono break-all" : ""}>{value}</div>
    </div>
  );
}