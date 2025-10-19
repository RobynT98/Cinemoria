// src/db.ts
import Dexie, { Table } from "dexie";

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
}

export interface MovieListLink {
  id?: number;
  movieId: number;
  listId: number;
}

/* ---------- Typer: Böcker ---------- */

export type BookFormat = "paperback" | "hardcover" | "ebook" | "audiobook" | "other";

export interface Book {
  id?: number;
  title: string;
  author?: string;
  year?: number;
  genres?: string[];
  coverUrl?: string;
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;      // e-bok/ljudbok
  format?: BookFormat;    // ex. hardcover/paperback/ebook/audiobook
  isbn?: string;
  language?: string;      // "sv", "en", …
  notes?: string;
  createdAt: number;
}

/* ---------- Dexie DB ---------- */

class CinemoriaDB extends Dexie {
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieListLink, number>;
  books!: Table<Book, number>;

  constructor() {
    super("cinemoria");

    // v1 – grund
    this.version(1).stores({
      movies: "++id, title, year, createdAt",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",
    });

    // v2 – samlarfält (film)
    this.version(2)
      .stores({
        movies:
          "++id, title, year, createdAt, owned, wishlisted, digital, format",
        lists: "++id, name, createdAt",
        movieList: "++id, movieId, listId",
      })
      .upgrade(async (tx) => {
        const all = await tx.table<Movie>("movies").toArray();
        for (const m of all) {
          if (m.owned === undefined) m.owned = false;
          if (m.wishlisted === undefined) m.wishlisted = false;
          if (m.digital === undefined) m.digital = false;
          if (!m.format) m.format = m.digital ? "digital" : "other";
          await tx.table<Movie>("movies").put(m);
        }
      });

    // v3 – utgåva/teknik/streckkod + index (film)
    this.version(3)
      .stores({
        movies:
          "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
        lists: "++id, name, createdAt",
        movieList: "++id, movieId, listId",
      })
      .upgrade(async (tx) => {
        const table = tx.table<Movie>("movies");
        const all = await table.toArray();
        for (const m of all) {
          if (!m.region) m.region = m.format === "digital" ? "NONE" : undefined;
          await table.put(m);
        }
      });

    // v4 – böcker (egen tabell)
    this.version(4)
      .stores({
        movies:
          "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
        lists: "++id, name, createdAt",
        movieList: "++id, movieId, listId",
        books:
          "++id, title, author, year, createdAt, owned, wishlisted, digital, format, isbn",
      })
      .upgrade(async (tx) => {
        // Inget att migrera från tidigare versioner (ny tabell),
        // men här skulle vi kunna normalisera data om det behövs framåt.
        await tx.table<Book>("books").toCollection().modify(() => {});
      });
  }
}

export const db = new CinemoriaDB();

/* ---------- Filmer: CRUD & helpers ---------- */

export async function addMovie(movie: Omit<Movie, "id" | "createdAt">) {
  const now = Date.now();
  const id = await db.movies.add({ ...movie, createdAt: now });
  return id;
}

export async function updateMovie(id: number, patch: Partial<Movie>) {
  await db.movies.update(id, patch);
}

export async function deleteMovie(id: number) {
  // rensa länkar också
  await db.transaction("rw", db.movies, db.movieList, async () => {
    await db.movies.delete(id);
    const links = await db.movieList.where("movieId").equals(id).toArray();
    for (const l of links) if (l.id) await db.movieList.delete(l.id);
  });
}

export async function getMovie(id: number) {
  return db.movies.get(id);
}

export async function getMovies() {
  return db.movies.orderBy("createdAt").reverse().toArray();
}

export async function getRecentMovies(limit = 20) {
  return db.movies.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function setSeen(id: number, seen: boolean) {
  await db.movies.update(id, { seen });
}

export async function setRating(id: number, rating?: number) {
  await db.movies.update(id, { rating });
}

export async function searchMovies(opts: {
  text?: string;
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Format;
}) {
  const { text, owned, wishlisted, digital, format } = opts;
  let col = db.movies.toCollection();

  // snabba filter först
  if (owned !== undefined) col = col.filter((m) => !!m.owned === owned);
  if (wishlisted !== undefined) col = col.filter((m) => !!m.wishlisted === wishlisted);
  if (digital !== undefined) col = col.filter((m) => !!m.digital === digital);
  if (format) col = col.filter((m) => m.format === format);

  if (text && text.trim()) {
    const q = text.trim().toLowerCase();
    col = col.filter((m) => {
      if (m.title?.toLowerCase().includes(q)) return true;
      if (m.genres?.some((g) => g.toLowerCase().includes(q))) return true;
      if (m.barcode?.toLowerCase().includes(q)) return true;
      if (m.edition?.toLowerCase().includes(q)) return true;
      return false;
    });
  }

  return col.toArray();
}

/* ---------- Listor (film) ---------- */

export async function createList(name: string) {
  const id = await db.lists.add({ name: name.trim(), createdAt: Date.now() });
  return id;
}

export async function getLists() {
  return db.lists.orderBy("createdAt").reverse().toArray();
}

export async function renameList(id: number, name: string) {
  await db.lists.update(id, { name: name.trim() });
}

export async function deleteList(id: number) {
  await db.transaction("rw", db.lists, db.movieList, async () => {
    await db.lists.delete(id);
    const links = await db.movieList.where("listId").equals(id).toArray();
    for (const l of links) if (l.id) await db.movieList.delete(l.id);
  });
}

/** Antal filmer per lista (nycklar som strängar för UI-kompat). */
export async function getListCounts(): Promise<Record<string, number>> {
  const all = await db.movieList.toArray();
  const out: Record<string, number> = {};
  for (const x of all) {
    const k = String(x.listId);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
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

/* ---------- Böcker: CRUD & sök ---------- */

export async function addBook(book: Omit<Book, "id" | "createdAt">) {
  const now = Date.now();
  const id = await db.books.add({ ...book, createdAt: now });
  return id;
}

export async function updateBook(id: number, patch: Partial<Book>) {
  await db.books.update(id, patch);
}

export async function deleteBook(id: number) {
  await db.books.delete(id);
}

export async function getBook(id: number) {
  return db.books.get(id);
}

export async function getBooks() {
  return db.books.orderBy("createdAt").reverse().toArray();
}

export async function getRecentBooks(limit = 20) {
  return db.books.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function searchBooks(opts: {
  text?: string;
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: BookFormat;
}) {
  const { text, owned, wishlisted, digital, format } = opts;
  let col = db.books.toCollection();

  if (owned !== undefined) col = col.filter((b) => !!b.owned === owned);
  if (wishlisted !== undefined) col = col.filter((b) => !!b.wishlisted === wishlisted);
  if (digital !== undefined) col = col.filter((b) => !!b.digital === digital);
  if (format) col = col.filter((b) => b.format === format);

  if (text && text.trim()) {
    const q = text.trim().toLowerCase();
    col = col.filter((b) => {
      if (b.title?.toLowerCase().includes(q)) return true;
      if (b.author?.toLowerCase().includes(q)) return true;
      if (b.genres?.some((g) => g.toLowerCase().includes(q))) return true;
      if (b.isbn?.toLowerCase().includes(q)) return true;
      return false;
    });
  }

  return col.toArray();
}

/* ---------- Export / Import / Wipe ---------- */

export async function exportJson(): Promise<string> {
  const [movies, lists, links, books] = await Promise.all([
    db.movies.toArray(),
    db.lists.toArray(),
    db.movieList.toArray(),
    db.books.toArray(),
  ]);
  return JSON.stringify({ movies, lists, links, books }, null, 2);
}

// Exportera subset (film) – t.ex. bara ägda/önskelista eller urval av id:n
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
  const [lists, links, books] = await Promise.all([
    db.lists.toArray(),
    db.movieList.toArray(),
    db.books.toArray(),
  ]);
  return JSON.stringify({ movies, lists, links, books }, null, 2);
}

export async function importJson(json: string) {
  const { movies = [], lists = [], links = [], books = [] } = JSON.parse(json || "{}");
  let addedMovies = 0, addedLists = 0, addedLinks = 0, addedBooks = 0;

  await db.transaction("rw", db.movies, db.lists, db.movieList, db.books, async () => {
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
    for (const b of books) {
      const copy = { ...b }; delete (copy as any).id;
      await db.books.add(copy); addedBooks++;
    }
  });

  return { addedMovies, addedLists, addedLinks, addedBooks };
}

export async function wipeAll() {
  await db.transaction("rw", db.movies, db.lists, db.movieList, db.books, async () => {
    await db.movies.clear();
    await db.lists.clear();
    await db.movieList.clear();
    await db.books.clear();
  });
}