import { type Album } from "@/types";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="card p-3">
      <div className="font-medium truncate">{album.title}</div>
      <div className="text-sand-300 text-sm truncate">
        {(album.artist || "Okänd artist")}{album.year ? ` • ${album.year}` : ""}{album.format ? ` • ${label(album.format)}` : ""}
      </div>
    </div>
  );
}
function label(f?: Album["format"]) {
  switch (f) {
    case "cd": return "CD";
    case "vinyl": return "Vinyl";
    case "cassette": return "Kassett";
    case "digital": return "Digital";
    default: return "Övrigt";
  }
}