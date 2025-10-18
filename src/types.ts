// src/types.ts

// --- Filmstatus (för “planerad”, “pågående”, “sett”) ---
export type MovieStatus = 'planned' | 'watching' | 'watched';

// --- Fysisk/digital utgåveinfo ---
export type Format =
  | 'uhd'      // 4K UHD
  | 'bluray'
  | 'dvd'
  | 'digital'
  | 'vhs'
  | 'other';

export type VideoStandard = 'PAL' | 'NTSC' | 'SECAM';

export type RegionCode =
  | 'BD-A' | 'BD-B' | 'BD-C'
  | 'DVD-1' | 'DVD-2' | 'DVD-3' | 'DVD-4' | 'DVD-5' | 'DVD-6' | 'DVD-ALL'
  | 'NONE';

// --- Filmobjekt som lagras i Dexie ---
export interface Movie {
  id?: number;                 // Dexie PK (auto)
  title: string;
  year?: number;

  posterUrl?: string;
  trailerUrl?: string;

  genres?: string[];           // exempel: ["Fantasy", "Family"]
  tags?: string[];             // fria etiketter: ["köpt", "UK-dub", "Steelbook"]

  status?: MovieStatus;        // planned | watching | watched
  rating?: number;             // 0–10
  notes?: string;

  // Samlarfält / “inventarie”
  owned?: boolean;             // äger fysisk/digital
  wishlisted?: boolean;        // önskelista
  digital?: boolean;           // digitalt ägd (köp/stream-länk i provider)
  format?: Format;             // bluray/dvd/uhd/vhs/digital/other
  location?: string;           // hylla/låda/konto
  provider?: string;           // t.ex. iTunes/Google/Plex

  // Utgåvedetaljer
  edition?: string;            // "First Press UK", "Steelbook"…
  releaseYear?: number;        // utgåvans år (inte filmens)
  cut?: string;                // "Theatrical", "Extended", "Director's Cut"
  audioVariant?: string;       // "Original UK", "US dub"
  videoStandard?: VideoStandard; // PAL/NTSC/SECAM
  region?: RegionCode;         // BD-B, DVD-2 etc (eller NONE för digitalt)
  barcode?: string;            // EAN/UPC

  createdAt: number;
  updatedAt: number;
}

// --- Listor / kopplingar ---
export interface List {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface MovieListLink {
  id?: number;                 // Dexie PK (auto)
  movieId: number;
  listId: number;
  createdAt: number;
}