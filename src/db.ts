// src/db.ts
import Dexie, { Table } from "dexie";
import {
  Movie,
  List,
  MovieListLink,
  Book,
  BookList,
  BookListLink,
  Game,
  GameList,
  GameListLink,
} from "./types";

// Re-exportera typer så befintliga imports från "@/db" fortsätter funka
export type {
  Movie,
  List,
  MovieListLink,
  Book,
  BookList,
  BookListLink,
  Game,
  GameList,
  GameListLink,
} from "./types";

export class CinemoriaDB extends Dexie {
  // Filmer
  movies!: Table<Movie, number>;
  movieLists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  // Böcker
  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookListLinks!: Table<BookListLink, number>;

  // Spel
  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameListLinks!: Table<GameListLink, number>;

  constructor() {
    super("CinemoriaDB");

    this.version(1).stores({
      // --- Filmer ---
      movies:
        "++id, title, year, owned, wishlisted, format, createdAt, barcode",
      movieLists: "++id, name, createdAt",
      movieListLinks: "++id, movieId, listId",

      // --- Böcker ---
      books: "++id, title, author, year, owned, wishlisted, format, createdAt",
      bookLists: "++id, name, createdAt",
      bookListLinks: "++id, bookId, listId",

      // --- Spel ---
      games:
        "++id, title, year, platform, owned, wishlisted, createdAt",
      gameLists: "++id, name, createdAt",
      gameListLinks: "++id, gameId, listId",
    });
  }
}

export const db = new CinemoriaDB();

/* ============================================================
   FILM – CRUD + sök
   ============================================================ */

export async function addMovie(movie: Omit<Movie, "id" | "createdAt">) {
  return db.movies.add({ ...movie, createdAt: Date.now() });
}

export async function updateMovie(id: number, patch: Partial<Movie>) {
  await db.movies.update(id, patch);
}

export async function deleteMovie(id: number) {
  await db.transaction("rw", [db.movies, db.movieListLinks], async () => {
    await db.movies.delete(id);
    const links = await db.movieListLinks.where("movieId").equals(id).toArray();
    for (const l of links) if (l.id) await db.movieListLinks.delete(l.id);
  });
}

export function getMovie(id: number) {
  return db.movies.get(id);
}

export function getMovies() {
  return db.movies.orderBy("createdAt").reverse().toArray();
}

export function getRecentMovies(limit = 20) {
  return db.movies.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function searchMovies(opts: {
  text?: string;
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Movie["format"];
}) {
  const { text, owned, wishlisted, digital, format } = opts;
  let col = db.movies.toCollection();

  if (owned !== undefined) col = col.filter((m) => !!m.owned === owned);
  if (wishlisted !== undefined) col = col.filter((m) => !!m.wishlisted === wishlisted);
  if (digital !== undefined) col = col.filter((m) => !!m.digital === digital);
  if (format) col = col.filter((m) => m.format === format);

  if (text?.trim()) {
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

/* ============================================================
   FILM – listor (tillbakakompatibla namn)
   ============================================================ */

export function createList(name: string) {
  return db.movieLists.add({ name: name.trim(), createdAt: Date.now() });
}

export function getLists() {
  return db.movieLists.orderBy("createdAt").reverse().toArray();
}

export function renameList(id: number, name: string) {
  return db.movieLists.update(id, { name: name.trim() });
}

export async function deleteList(id: number) {
  await db.transaction("rw", [db.movieLists, db.movieListLinks], async () => {
    await db.movieLists.delete(id);
    const links = await db.movieListLinks.where("listId").equals(id).toArray();
    for (const l of links) if (l.id) await db.movieListLinks.delete(l.id);
  });
}

export async function getListCounts(): Promise<Record<string, number>> {
  const all = await db.movieListLinks.toArray();
  const out: Record<string, number> = {};
  for (const x of all) {
    const key = String(x.listId);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

export function getListById(id: number) {
  return db.movieLists.get(id);
}

export async function getMoviesInList(listId: number) {
  const links = await db.movieListLinks.where("listId").equals(listId).toArray();
  const ids = links.map((x) => x.movieId);
  if (!ids.length) return [];
  return db.movies.where("id").anyOf(ids).toArray();
}

export async function linkMovieToList(listId: number, movieId: number) {
  const exists = await db.movieListLinks.where({ listId, movieId }).first();
  if (!exists) await db.movieListLinks.add({ listId, movieId, createdAt: Date.now() } as any);
}

export async function unlinkMovieFromList(listId: number, movieId: number) {
  const row = await db.movieListLinks.where({ listId, movieId }).first();
  if (row?.id) await db.movieListLinks.delete(row.id);
}

/* ============================================================
   BÖCKER – CRUD + listor (API spegel)
   ============================================================ */

export function addBook(book: Omit<Book, "id" | "createdAt">) {
  return db.books.add({ ...book, createdAt: Date.now() });
}

export function updateBook(id: number, patch: Partial<Book>) {
  return db.books.update(id, patch);
}

export function deleteBook(id: number) {
  return db.books.delete(id);
}

export function getBook(id: number) {
  return db.books.get(id);
}

export function getBooks() {
  return db.books.orderBy("createdAt").reverse().toArray();
}

export function getRecentBooks(limit = 20) {
  return db.books.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function searchBooks(opts: {
  text?: string;
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  format?: Book["format"];
  language?: string;
}) {
  const { text, owned, wishlisted, digital, format, language } = opts;
  let col = db.books.toCollection();

  if (owned !== undefined) col = col.filter((b) => !!b.owned === owned);
  if (wishlisted !== undefined) col = col.filter((b) => !!b.wishlisted === wishlisted);
  if (digital !== undefined) col = col.filter((b) => !!b.digital === digital);
  if (format) col = col.filter((b) => b.format === format);
  if (language?.trim())
    col = col.filter(
      (b) => (b.language || "").toLowerCase() === language.trim().toLowerCase()
    );

  if (text?.trim()) {
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

// Boklistor
export function createBookList(name: string) {
  return db.bookLists.add({ name: name.trim(), createdAt: Date.now() });
}
export function getBookLists() {
  return db.bookLists.orderBy("createdAt").reverse().toArray();
}
export function renameBookList(id: number, name: string) {
  return db.bookLists.update(id, { name: name.trim() });
}
export async function deleteBookList(id: number) {
  await db.transaction("rw", [db.bookLists, db.bookListLinks], async () => {
    await db.bookLists.delete(id);
    const links = await db.bookListLinks.where("listId").equals(id).toArray();
    for (const l of links) if (l.id) await db.bookListLinks.delete(l.id);
  });
}
export async function getBookListCounts(): Promise<Record<string, number>> {
  const all = await db.bookListLinks.toArray();
  const out: Record<string, number> = {};
  for (const x of all) {
    const key = String(x.listId);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}
export function getBookListById(id: number) {
  return db.bookLists.get(id);
}
export async function getBooksInBookList(listId: number) {
  const links = await db.bookListLinks.where("listId").equals(listId).toArray();
  const ids = links.map((x) => x.bookId);
  if (!ids.length) return [];
  return db.books.where("id").anyOf(ids).toArray();
}
export async function linkBookToList(listId: number, bookId: number) {
  const exists = await db.bookListLinks.where({ listId, bookId }).first();
  if (!exists) await db.bookListLinks.add({ listId, bookId, createdAt: Date.now() } as any);
}
export async function unlinkBookFromList(listId: number, bookId: number) {
  const row = await db.bookListLinks.where({ listId, bookId }).first();
  if (row?.id) await db.bookListLinks.delete(row.id);
}

/* ============================================================
   SPEL – CRUD + listor (API spegel)
   ============================================================ */

export function addGame(game: Omit<Game, "id" | "createdAt">) {
  return db.games.add({ ...game, createdAt: Date.now() });
}

export function updateGame(id: number, patch: Partial<Game>) {
  return db.games.update(id, patch);
}

export function deleteGame(id: number) {
  return db.games.delete(id);
}

export function getGame(id: number) {
  return db.games.get(id);
}

export function getGames() {
  return db.games.orderBy("createdAt").reverse().toArray();
}

export function getRecentGames(limit = 20) {
  return db.games.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function searchGames(opts: {
  text?: string;
  platform?: Game["platform"];
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
}) {
  const { text, platform, owned, digital, wishlisted } = opts;
  let col = db.games.toCollection();

  if (owned !== undefined) col = col.filter((g) => !!g.owned === owned);
  if (digital !== undefined) col = col.filter((g) => !!g.digital === digital);
  if (wishlisted !== undefined) col = col.filter((g) => !!g.wishlisted === wishlisted);
  if (platform) col = col.filter((g) => g.platform === platform);

  if (text?.trim()) {
    const q = text.trim().toLowerCase();
    col = col.filter((g) => {
      if (g.title?.toLowerCase().includes(q)) return true;
      if ((g.platform || "").toLowerCase().includes(q)) return true;
      return false;
    });
  }

  return col.toArray();
}

// Spellistor
export function createGameList(name: string) {
  return db.gameLists.add({ name: name.trim(), createdAt: Date.now() });
}
export function getGameLists() {
  return db.gameLists.orderBy("createdAt").reverse().toArray();
}
export function renameGameList(id: number, name: string) {
  return db.gameLists.update(id, { name: name.trim() });
}
export async function deleteGameList(id: number) {
  await db.transaction("rw", [db.gameLists, db.gameListLinks], async () => {
    await db.gameLists.delete(id);
    const links = await db.gameListLinks.where("listId").equals(id).toArray();
    for (const l of links) if (l.id) await db.gameListLinks.delete(l.id);
  });
}
export async function getGameListCounts(): Promise<Record<string, number>> {
  const all = await db.gameListLinks.toArray();
  const out: Record<string, number> = {};
  for (const x of all) {
    const key = String(x.listId);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}
export function getGameListById(id: number) {
  return db.gameLists.get(id);
}
export async function getGamesInGameList(listId: number) {
  const links = await db.gameListLinks.where("listId").equals(listId).toArray();
  const ids = links.map((x) => x.gameId);
  if (!ids.length) return [];
  return db.games.where("id").anyOf(ids).toArray();
}
export async function linkGameToList(listId: number, gameId: number) {
  const exists = await db.gameListLinks.where({ listId, gameId }).first();
  if (!exists) await db.gameListLinks.add({ listId, gameId, createdAt: Date.now() } as any);
}
export async function unlinkGameFromList(listId: number, gameId: number) {
  const row = await db.gameListLinks.where({ listId, gameId }).first();
  if (row?.id) await db.gameListLinks.delete(row.id);
}

/* ============================================================
   Export / Import / Wipe (för Profil-sidan)
   ============================================================ */

export async function exportJson(): Promise<string> {
  const [
    movies, mLists, mLinks,
    books, bLists, bLinks,
    games, gLists, gLinks,
  ] = await Promise.all([
    db.movies.toArray(),
    db.movieLists.toArray(),
    db.movieListLinks.toArray(),
    db.books.toArray(),
    db.bookLists.toArray(),
    db.bookListLinks.toArray(),
    db.games.toArray(),
    db.gameLists.toArray(),
    db.gameListLinks.toArray(),
  ]);

  return JSON.stringify(
    {
      movies,
      lists: mLists,
      links: mLinks,
      books,
      bookLists: bLists,
      bookLinks: bLinks,
      games,
      gameLists: gLists,
      gameLinks: gLinks,
    },
    null,
    2
  );
}

export async function importJson(text: string) {
  type Backup = {
    movies?: Movie[];
    lists?: List[];
    links?: MovieListLink[];
    books?: Book[];
    bookLists?: BookList[];
    bookLinks?: BookListLink[];
    games?: Game[];
    gameLists?: GameList[];
    gameLinks?: GameListLink[];
  };

  let data: Backup;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Ogiltig JSON");
  }

  const movies = Array.isArray(data.movies) ? data.movies : [];
  const lists = Array.isArray(data.lists) ? data.lists : [];
  const links = Array.isArray(data.links) ? data.links : [];

  const books = Array.isArray(data.books) ? data.books : [];
  const bookLists = Array.isArray(data.bookLists) ? data.bookLists : [];
  const bookLinks = Array.isArray(data.bookLinks) ? data.bookLinks : [];

  const games = Array.isArray(data.games) ? data.games : [];
  const gameLists = Array.isArray(data.gameLists) ? data.gameLists : [];
  const gameLinks = Array.isArray(data.gameLinks) ? data.gameLinks : [];

  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  const movieIdMap = new Map<number, number>();
  const listIdMap = new Map<number, number>();
  const bookIdMap = new Map<number, number>();
  const bookListIdMap = new Map<number, number>();
  const gameIdMap = new Map<number, number>();
  const gameListIdMap = new Map<number, number>();

  await db.transaction(
    "rw",
    [
      db.movies, db.movieLists, db.movieListLinks,
      db.books, db.bookLists, db.bookListLinks,
      db.games, db.gameLists, db.gameListLinks,
    ],
    async () => {
      // Filmer
      for (const m of movies) {
        const { id: _omit, ...rest } = m;
        const id = await db.movies.add({ ...rest, createdAt: rest.createdAt || Date.now() });
        addedMovies++;
        if (typeof m.id === "number") movieIdMap.set(m.id, id);
      }
      for (const l of lists) {
        const { id: _omit, ...rest } = l;
        const id = await db.movieLists.add({ ...rest, createdAt: rest.createdAt || Date.now() });
        addedLists++;
        if (typeof l.id === "number") listIdMap.set(l.id, id);
      }
      for (const ln of links) {
        const movieId = movieIdMap.get(ln.movieId) ?? ln.movieId;
        const listId = listIdMap.get(ln.listId) ?? ln.listId;
        if (typeof movieId !== "number" || typeof listId !== "number") continue;
        const exists = await db.movieListLinks.where({ movieId, listId }).first();
        if (!exists) { await db.movieListLinks.add({ movieId, listId, createdAt: Date.now() } as any); addedLinks++; }
      }

      // Böcker
      for (const b of books) {
        const { id: _omit, ...rest } = b;
        const id = await db.books.add({ ...rest, createdAt: rest.createdAt || Date.now() });
        addedBooks++;
        if (typeof b.id === "number") bookIdMap.set(b.id, id);
      }
      for (const bl of bookLists) {
        const { id: _omit, ...rest } = bl;
        const id = await db.bookLists.add({ ...rest, createdAt: rest.createdAt || Date.now() });
        addedBookLists++;
        if (typeof bl.id === "number") bookListIdMap.set(bl.id, id);
      }
      for (const ln of bookLinks) {
        const bookId = bookIdMap.get(ln.bookId) ?? ln.bookId;
        const listId = bookListIdMap.get(ln.listId) ?? ln.listId;
        if (typeof bookId !== "number" || typeof listId !== "number") continue;
        const exists = await db.bookListLinks.where({ bookId, listId }).first();
        if (!exists) { await db.bookListLinks.add({ bookId, listId, createdAt: Date.now() } as any); addedBookLinks++; }
      }

      // Spel
      for (const g of games) {
        const { id: _omit, ...rest } = g;
        const id = await db.games.add({ ...rest, createdAt: rest.createdAt || Date.now() });
        addedGames++;
        if (typeof g.id === "number") gameIdMap.set(g.id, id);
      }
      for (const gl of gameLists) {
        const { id: _omit, ...rest } = gl;
        const id = await db.gameLists.add({ ...rest, createdAt: rest.createdAt || Date.now() });
        addedGameLists++;
        if (typeof gl.id === "number") gameListIdMap.set(gl.id, id);
      }
      for (const ln of gameLinks) {
        const gameId = gameIdMap.get(ln.gameId) ?? ln.gameId;
        const listId = gameListIdMap.get(ln.listId) ?? ln.listId;
        if (typeof gameId !== "number" || typeof listId !== "number") continue;
        const exists = await db.gameListLinks.where({ gameId, listId }).first();
        if (!exists) { await db.gameListLinks.add({ gameId, listId, createdAt: Date.now() } as any); addedGameLinks++; }
      }
    }
  );

  return {
    addedMovies, addedLists, addedLinks,
    addedBooks, addedBookLists, addedBookLinks,
    addedGames, addedGameLists, addedGameLinks,
  };
}

export async function wipeAll() {
  await db.transaction(
    "rw",
    [
      db.movies, db.movieLists, db.movieListLinks,
      db.books, db.bookLists, db.bookListLinks,
      db.games, db.gameLists, db.gameListLinks,
    ],
    async () => {
      await db.movieListLinks.clear();
      await db.movieLists.clear();
      await db.movies.clear();

      await db.bookListLinks.clear();
      await db.bookLists.clear();
      await db.books.clear();

      await db.gameListLinks.clear();
      await db.gameLists.clear();
      await db.games.clear();
    }
  );
}