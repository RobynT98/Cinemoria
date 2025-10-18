// src/db.ts
import Dexie, { Table } from "dexie";

export type Format =
  | "uhd"     // 4K UHD
  | "bluray"
  | "dvd"
  | "digital"
  | "vhs"
  | "other";

export type VideoStandard = "PAL" | "NTSC" | "SECAM";
export type RegionCode =
  | "BD-A" | "BD-B" | "BD-C"     // Blu-ray regioner
  | "DVD-1" | "DVD-2" | "DVD-3" | "DVD-4" | "DVD-5" | "DVD-6" | "DVD-ALL"
  | "NONE";                      // för digital/övrigt

export interface Movie {
  id?: number;
  title: string;
  year?: number;
  genres?: string[];
  posterUrl?: string;
  seen?: boolean;
  rating?: number;       // 1-10
  trailerUrl?: string;
  createdAt: number;

  // Samling
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Format;
  location?: string;     // hylla/låda/konto
  provider?: string;     // t.ex. iTunes/Google/Plex

  // Utgåva/tekniskt
  edition?: string;          // t.ex. "First Press UK", "Steelbook", "Collector's"
  releaseYear?: number;      // utgåvans år (inte filmens)
  cut?: string;              // "Theatrical", "Extended", "Director's Cut"…
  audioVariant?: string;     // t.ex. "Original UK", "US dub"
  videoStandard?: VideoStandard; // PAL/NTSC/SECAM
  region?: RegionCode;       // BD-B, DVD-2 osv eller NONE
  barcode?: string;          // EAN/UPC
  notes?: string;            // fria anteckningar
}

export interface List {
  id?: number;
  name: string;
  createdAt: number;
}

export interface MovieListLink {
  id?: number;
  movieId: number;
  listId: number;
}

class CinemoriaDB extends Dexie {
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieListLink, number>;

  constructor() {
    super("cinemoria");

    // v1 – ursprung
    this.version(1).stores({
      movies: "++id, title, year, createdAt",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",
    });

    // v2 – samlarfält
    this.version(2).stores({
      movies:
        "++id, title, year, createdAt, owned, wishlisted, digital, format",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",
    }).upgrade(async (tx) => {
      const all = await tx.table<Movie>("movies").toArray();
      for (const m of all) {
        if (m.owned === undefined) m.owned = false;
        if (m.wishlisted === undefined) m.wishlisted = false;
        if (m.digital === undefined) m.digital = false;
        if (!m.format) m.format = m.digital ? "digital" : "other";
        await tx.table<Movie>("movies").put(m);
      }
    });

    // v3 – utgåva/teknik/streckkod + index
    this.version(3).stores({
      movies:
        "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",
    }).upgrade(async (tx) => {
      const table = tx.table<Movie>("movies");
      const all = await table.toArray();
      for (const m of all) {
        if (!m.region) m.region = m.format === "digital" ? "NONE" : undefined;
        await table.put(m);
      }
    });
  }
}

export const db = new CinemoriaDB();

/* --------- Export/Import/Wipe (som tidigare) --------- */
export async function exportJson(): Promise<string> {
  const [movies, lists, links] = await Promise.all([
    db.movies.toArray(),
    db.lists.toArray(),
    db.movieList.toArray(),
  ]);
  return JSON.stringify({ movies, lists, links }, null, 2);
}

// Exportera subset (t.ex. bara ägda, bara önskelista, eller urval av id:n)
export async function exportSubset(opts: {
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  ids?: number[];
}) {
  const { owned, wishlisted, digital, ids } = opts;
  let q = db.movies.toCollection();

  if (ids?.length) {
    q = db.movies.where("id").anyOf(ids as number[]);
  } else {
    if (owned !== undefined) q = q.filter((m) => !!m.owned === owned);
    if (wishlisted !== undefined) q = q.filter((m) => !!m.wishlisted === wishlisted);
    if (digital !== undefined) q = q.filter((m) => !!m.digital === digital);
  }

  const movies = await q.toArray();
  const [lists, links] = await Promise.all([
    db.lists.toArray(),
    db.movieList.toArray(),
  ]);

  return JSON.stringify({ movies, lists, links }, null, 2);
}

export async function importJson(json: string) {
  const { movies = [], lists = [], links = [] } = JSON.parse(json || "{}");
  let addedMovies = 0, addedLists = 0, addedLinks = 0;

  await db.transaction("rw", db.movies, db.lists, db.movieList, async () => {
    for (const m of movies) {
      const copy = { ...m }; delete (copy as any).id;
      await db.movies.add(copy); addedMovies++;
    }
    for (const l of lists) {
      const copy = { ...l }; delete (copy as any).id;
      await db.lists.add(copy); addedLists++;
    }
    for (const x of links) {
      const copy = { ...x }; delete (copy as any).id;
      await db.movieList.add(copy); addedLinks++;
    }
  });

  return { addedMovies, addedLists, addedLinks };
}

export async function wipeAll() {
  await db.transaction("rw", db.movies, db.lists, db.movieList, async () => {
    await db.movies.clear();
    await db.lists.clear();
    await db.movieList.clear();
  });
}
export async function getListById(id: number) {
  return db.lists.get(id);
}

export async function getMoviesInList(listId: number) {
  const links = await db.movieList.where("listId").equals(listId).toArray();
  const ids = links.map((x) => x.movieId);
  if (!ids.length) return [];
  return db.movies.where("id").anyOf(ids).toArray();
}

export async function linkMovieToList(listId: number, movieId: number) {
  const exists = await db.movieList.where({ listId, movieId }).first();
  if (!exists) await db.movieList.add({ listId, movieId } as any);
}

export async function unlinkMovieFromList(listId: number, movieId: number) {
  const row = await db.movieList.where({ listId, movieId }).first();
  if (row?.id) await db.movieList.delete(row.id);
}