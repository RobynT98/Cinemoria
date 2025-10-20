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