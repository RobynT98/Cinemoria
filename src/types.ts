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
// --- MUSIC ---
export type MusicFormat = "cd" | "vinyl" | "cassette" | "digital" | "minidisc" | "other";

export interface Album {
  id?: number;
  title: string;
  artist: string;
  year?: number;
  genres: string[];          // kommaseparerad i UI -> array i modellen
  coverUrl?: string;
  owned: boolean;
  digital: boolean;
  wishlisted: boolean;
  format: MusicFormat;
  // metadata
  barcode?: string;          // EAN/UPC
  label?: string;            // skivbolag
  catalogNo?: string;        // t.ex. "WARP123"
  country?: string;          // "SE", "UK", "US" …
  language?: string;         // "sv", "en" …
  discs?: number;            // antal skivor
  tracks?: number;           // total antal spår
  durationMin?: number;      // total speltid i minuter (valfritt)
  edition?: string;          // "Deluxe", "Remastered 2011" …
  releaseYear?: number;      // utgåveår om skilt från originalår
  location?: string;         // hylla/låda
  notes?: string;

  createdAt: number;
  updatedAt?: number;
}

export interface AlbumList {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AlbumLink {
  id?: number;
  listId: number;
  albumId: number;
  createdAt: number;
}

// --- COMICS (serietidningar) ---
export type ComicFormat = "single" | "tpb" | "hardcover" | "manga" | "magazine" | "digital" | "other";

export interface Comic {
  id?: number;
  title: string;             // titel på numret/volymen
  series?: string;           // serie-namn (t.ex. "Batman")
  issueNumber?: string;      // t.ex. "#12", "12A"
  volume?: string;           // volym/årgång om relevant
  year?: number;
  month?: number;            // 1–12 (om du vill)
  genres: string[];
  coverUrl?: string;

  owned: boolean;
  digital: boolean;
  wishlisted: boolean;
  format: ComicFormat;

  // metadata
  publisher?: string;        // DC, Marvel, Bonniers…
  writers?: string[];        // kommaseparerat i UI
  artists?: string[];        // kommaseparerat i UI
  language?: string;         // "sv", "en" …
  isbn?: string;             // för album/TPB
  issn?: string;             // för magasin
  barcode?: string;          // EAN (vanligt på svenska tidningar/album)
  printing?: string;         // "1st print", "2nd print"
  pages?: number;
  condition?: string;        // valfri fri text (VG, FN, NM…)
  location?: string;
  edition?: string;          // "Deluxe", "Omnibus", "Special"
  notes?: string;

  createdAt: number;
  updatedAt?: number;
}

export interface ComicList {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ComicLink {
  id?: number;
  listId: number;
  comicId: number;
  createdAt: number;
}