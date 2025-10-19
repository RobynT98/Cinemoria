// src/types.ts

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
  title: string;
  year?: number;
  posterUrl?: string;
  trailerUrl?: string;
  genres?: string[];
  tags?: string[];

  status?: MovieStatus;
  rating?: number;
  notes?: string;

  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Format;
  location?: string;
  provider?: string;

  edition?: string;
  releaseYear?: number;
  cut?: string;
  audioVariant?: string;
  videoStandard?: VideoStandard;
  region?: RegionCode;
  barcode?: string;

  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   BOK
   ============================================================ */

export type BookFormat = "paperback" | "hardcover" | "ebook" | "audiobook" | "other";

export interface Book {
  id?: number;
  title: string;
  author?: string;
  year?: number;
  coverUrl?: string;
  genres?: string[];
  tags?: string[];

  rating?: number;
  notes?: string;

  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: BookFormat;
  isbn?: string;
  language?: string;
  pages?: number;
  publisher?: string;
  location?: string;

  createdAt: number;
  updatedAt: number;
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
  title: string;
  developer?: string;
  publisher?: string;
  year?: number;
  coverUrl?: string;
  genres?: string[];
  tags?: string[];

  status?: GameStatus;
  rating?: number;
  notes?: string;

  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: GameFormat;
  platform?: GamePlatform;
  edition?: string;
  barcode?: string;
  location?: string;

  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   LISTOR (gemensam struktur för film/bok/spel)
   ============================================================ */

export interface List {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface MovieListLink {
  id?: number;
  movieId: number;
  listId: number;
  createdAt: number;
}

export interface BookListLink {
  id?: number;
  bookId: number;
  listId: number;
  createdAt: number;
}

export interface GameListLink {
  id?: number;
  gameId: number;
  listId: number;
  createdAt: number;
}