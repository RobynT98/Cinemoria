/* ============================================================
   FILM
   ============================================================ */

export type MovieStatus = "planned" | "watching" | "watched";

export type Format =
  | "uhd"      // 4K UHD
  | "bluray"
  | "dvd"
  | "digital"
  | "vhs"
  | "other";

export type VideoStandard = "PAL" | "NTSC" | "SECAM";

export type RegionCode =
  | "BD-A" | "BD-B" | "BD-C"
  | "DVD-1" | "DVD-2" | "DVD-3" | "DVD-4" | "DVD-5" | "DVD-6" | "DVD-ALL"
  | "NONE";

export interface Movie {
  id?: number;

  // Bas
  title: string;
  year?: number;
  posterUrl?: string;
  trailerUrl?: string;
  genres?: string[];
  tags?: string[];

  // Status/omdöme
  status?: MovieStatus;
  /** Används i UI som “Sett”-chip — separat från status för bakåtkomp. */
  seen?: boolean;
  rating?: number;
  notes?: string;

  // Ägande/samling
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Format;
  location?: string;
  provider?: string;

  // Tekniska/utgåve-detaljer
  edition?: string;
  releaseYear?: number;
  cut?: string;
  audioVariant?: string;
  videoStandard?: VideoStandard;
  region?: RegionCode;
  barcode?: string;

  createdAt: number;
  updatedAt?: number;
}

/* ============================================================
   BÖCKER
   ============================================================ */

export type BookFormat =
  | "paperback"
  | "hardcover"
  | "ebook"
  | "audiobook"
  | "other";

export interface Book {
  id?: number;

  // Bas
  title: string;
  author?: string;
  year?: number;
  coverUrl?: string;
  genres?: string[];
  tags?: string[];

  // Omdöme/anteckningar
  rating?: number;
  notes?: string;

  // Ägande
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;

  // Metadata
  format?: BookFormat;
  isbn?: string;
  language?: string;
  pages?: number;
  publisher?: string;
  location?: string;

  createdAt: number;
  updatedAt?: number;
}

/* ============================================================
   SPEL
   ============================================================ */

export type GamePlatform =
  | "PC"
  | "PlayStation"
  | "Xbox"
  | "Switch"
  | "Mobile"
  | "Retro"
  | "Other";

export type GameFormat = "physical" | "digital" | "cartridge" | "disc" | "other";
export type GameStatus = "planned" | "playing" | "completed" | "abandoned";

export interface Game {
  id?: number;

  // Bas
  title: string;
  developer?: string;
  publisher?: string;
  year?: number;
  coverUrl?: string;
  genres?: string[];
  tags?: string[];

  // Status/omdöme
  status?: GameStatus;
  rating?: number;
  notes?: string;

  // Ägande
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;

  // Metadata
  format?: GameFormat;
  platform?: GamePlatform | string;
  edition?: string;
  /** EAN/UPC – används i GameForm */
  barcode?: string;
  location?: string;

  createdAt: number;
  updatedAt?: number;
}

/* ============================================================
   LISTOR (gemensamt)
   ============================================================ */

export interface List {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

/* Film-listor */
export interface MovieListLink {
  id?: number;
  movieId: number;
  listId: number;
  createdAt: number;
}

/* Bok-listor */
export interface BookList {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt?: number;
}
export interface BookListLink {
  id?: number;
  bookId: number;
  listId: number;
  createdAt: number;
}

/* Spel-listor */
export interface GameList {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt?: number;
}
export interface GameListLink {
  id?: number;
  gameId: number;
  listId: number;
  createdAt: number;
}
/* ========== MUSIK (Album) ========== */

export type AlbumFormat =
  | "cd"
  | "vinyl"
  | "cassette"
  | "digital"
  | "sacd"
  | "bluray-audio"
  | "other";

export interface Album {
  id?: number;
  // Bas
  title: string;
  artist?: string;
  year?: number;
  genres?: string[];          // kommaseparerat i UI → lagras som array
  // Ägande/status
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  // Utgåva/teknik
  format?: AlbumFormat;       // CD/Vinyl/Digital/…
  edition?: string;           // t.ex. "Deluxe", "Remastered", "Limited"
  barcode?: string;           // EAN/UPC om du scannar
  language?: string;          // t.ex. "sv", "en" om relevant (texthäften)
  label?: string;             // skivbolag
  // Media
  coverUrl?: string;          // omslag (URL)
  notes?: string;             // fria anteckningar
  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface AlbumList {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface AlbumListLink {
  id?: number;
  albumId: number;
  listId: number;
  createdAt: number;
}

/* ========== SERIER (Comics) ========== */

export type ComicFormat =
  | "single-issue"     // lösnummer
  | "trade-paperback"  // TPB
  | "hardcover"        // HC
  | "omnibus"
  | "digital"
  | "magazine"
  | "other";

export interface Comic {
  id?: number;
  // Bas
  title: string;             // serie-/albumtitel
  seriesTitle?: string;      // om annan än title
  volume?: number;           // volymnummer (t.ex. vol 2)
  issueNumber?: number;      // #1, #12 etc (för lösnummer)
  year?: number;
  genres?: string[];
  // Kreatörer & utgivning
  writer?: string;
  artist?: string;
  publisher?: string;        // Marvel, DC, Egmont, etc.
  language?: string;         // "sv", "en"…
  pages?: number;
  isbn?: string;             // för samlingsvolymer
  barcode?: string;          // streckkod (vanligt på lösnummer)
  // Ägande/status
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  // Utgåva
  format?: ComicFormat;
  edition?: string;          // "Deluxe", "New Printing", etc.
  // Media
  coverUrl?: string;
  notes?: string;
  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface ComicList {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface ComicListLink {
  id?: number;
  comicId: number;
  listId: number;
  createdAt: number;
}

/* ========== Hjälp-etiketter (valfritt men praktiskt i UI) ========== */

export function labelAlbumFormat(f?: AlbumFormat) {
  switch (f) {
    case "cd": return "CD";
    case "vinyl": return "Vinyl";
    case "cassette": return "Kassett";
    case "digital": return "Digital";
    case "sacd": return "SACD";
    case "bluray-audio": return "Blu-ray Audio";
    default: return "Övrigt";
  }
}

export function labelComicFormat(f?: ComicFormat) {
  switch (f) {
    case "single-issue": return "Lösnummer";
    case "trade-paperback": return "TPB";
    case "hardcover": return "Inbunden";
    case "omnibus": return "Omnibus";
    case "digital": return "Digital";
    case "magazine": return "Magasin";
    default: return "Övrigt";
  }
}