import { type Comic } from "@/types";

export default function ComicCard({ comic }: { comic: Comic }) {
  return (
    <div className="card p-3">
      <div className="font-medium truncate">{comic.title}</div>
      <div className="text-sand-300 text-sm truncate">
        {(comic.series ? `${comic.series}` : "Fristående")}
        {comic.issue ? ` #${comic.issue}` : ""}{comic.year ? ` • ${comic.year}` : ""}
        {comic.format ? ` • ${label(comic.format)}` : ""}
      </div>
    </div>
  );
}
function label(f?: Comic["format"]) {
  switch (f) {
    case "single": return "Singel";
    case "trade": return "TPB";
    case "hardcover": return "Inbunden";
    case "digital": return "Digital";
    default: return "Övrigt";
  }
}