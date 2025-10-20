// src/types.ts

/* ---------- Typer: Film ---------- */

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
  genres?: string[];
  posterUrl?: string;
  seen?: boolean;
  rating?: number;          // 1–10
  trailerUrl?: string;
  createdAt: number;
  updatedAt?: number;

  // Samlarinfo
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Format;
  location?: string;        // hylla/låda/konto
  provider?: string;        // iTunes/Google/Plex …

  // Utgåva/teknik
  edition?: string;         // "First Press UK", "Steelbook" …
  releaseYear?: number;     // utgåvans år
  cut?: string;             // "Theatrical", "Extended" …
  audioVariant?: string;    // "Original UK", "US dub"
  videoStandard?: VideoStandard;
  region?: RegionCode;
  barcode?: string;         // EAN/UPC
  notes?: string;
}

/* ---------- Typer: Listor (film) ---------- */

export interface List {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

export interface MovieListLink {
  id?: number;
  movieId: number;
  listId: number;
}

/* ---------- Typer: Böcker ---------- */

export type BookFormat =
  | "paperback"
  | "hardcover"
  | "ebook"
  | "audiobook"
  | "other";

export interface Book {
  id?: number;
  title: string;
  author?: string;
  year?: number;
  genres?: string[];
  coverUrl?: string;
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;   // e-bok/ljudbok
  format?: BookFormat; // hardcover/paperback/ebook/audiobook/other
  isbn?: string;
  language?: string;   // "sv", "en", …
  pages?: number;
  publisher?: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

/* ---------- Typer: Boklistor ---------- */

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
}

/* ---------- Typer: Spel ---------- */

export interface Game {
  id?: number;
  title: string;
  year?: number;
  platform?: string;     // "PS5", "Switch", "PC"...
  coverUrl?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  notes?: string;
  barcode?: string;      // ✅ för skanning/offline-spar
  createdAt: number;
  updatedAt?: number;
}

/* ---------- Typer: Spellistor ---------- */

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
}