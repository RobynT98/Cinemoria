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
  format?: BookFormat;    // hardcover/paperback/ebook/audiobook/other
  isbn?: string;
  language?: string;      // "sv", "en", …
  pages?: number;
  publisher?: string;
  notes?: string;
  createdAt: number;
}

/* ---------- Typer: Boklistor ---------- */

export interface BookList {
  id?: number;
  name: string;
  createdAt: number;
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
  createdAt: number;
}

/* ---------- Typer: Spellistor ---------- */

export interface GameList {
  id?: number;
  name: string;
  createdAt: number;
}

export interface GameListLink {
  id?: number;
  gameId: number;
  listId: number;
}

/* ---------- Dexie DB ---------- */

class CinemoriaDB extends Dexie {
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieListLink, number>;

  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookList!: Table<BookListLink, number>;

  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameList!: Table<GameListLink, number>;

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

    // v4 – böcker
    this.version(4)
      .stores({
        movies:
          "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
        lists: "++id, name, createdAt",
        movieList: "++id, movieId, listId",
        books:
          "++id, title, author, year, createdAt, owned, wishlisted, digital, format, isbn",
      });

    // v5 – böcker: extra fält + index
    this.version(5)
      .stores({
        movies:
          "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
        lists: "++id, name, createdAt",
        movieList: "++id, movieId, listId",
        books:
          "++id, title, author, year, createdAt, owned, wishlisted, digital, format, isbn, language, pages, publisher",
      });

    // v6 – boklistor
    this.version(6).stores({
      movies:
        "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",

      books:
        "++id, title, author, year, createdAt, owned, wishlisted, digital, format, isbn, language, pages, publisher",
      bookLists: "++id, name, createdAt",
      bookList: "++id, bookId, listId",
    });

    // v7 – spel
    this.version(7).stores({
      movies:
        "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",

      books:
        "++id, title, author, year, createdAt, owned, wishlisted, digital, format, isbn, language, pages, publisher",
      bookLists: "++id, name, createdAt",
      bookList: "++id, bookId, listId",

      games:
        "++id, title, platform, year, createdAt, owned, digital, wishlisted",
    });

    // v8 – spellistor
    this.version(8).stores({
      movies:
        "++id, title, year, createdAt, owned, wishlisted, digital, format, region, videoStandard, barcode, edition, releaseYear",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",

      books:
        "++id, title, author, year, createdAt, owned, wishlisted, digital, format, isbn, language, pages, publisher",
      bookLists: "++id, name, createdAt",
      bookList: "++id, bookId, listId",

      games:
        "++id, title, platform, year, createdAt, owned, digital, wishlisted",
      gameLists: "++id, name, createdAt",
      gameList: "++id, gameId, listId",
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
  language?: string;
}) {
  const { text, owned, wishlisted, digital, format, language } = opts;
  let col = db.books.toCollection();

  if (owned !== undefined) col = col.filter((b) => !!b.owned === owned);
  if (wishlisted !== undefined) col = col.filter((b) => !!b.wishlisted === wishlisted);
  if (digital !== undefined) col = col.filter((b) => !!b.digital === digital);
  if (format) col = col.filter((b) => b.format === format);
  if (language && language.trim())
    col = col.filter((b) => (b.language || "").toLowerCase() === language.trim().toLowerCase());

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

/* ---------- Boklistor ---------- */

export async function createBookList(name: string) {
  return db.bookLists.add({ name: name.trim(), createdAt: Date.now() });
}

export async function getBookLists() {
  return db.bookLists.orderBy("createdAt").reverse().toArray();
}

export async function renameBookList(id: number, name: string) {
  await db.bookLists.update(id, { name: name.trim() });
}

export async function deleteBookList(id: number) {
  await db.transaction("rw", db.bookLists, db.bookList, async () => {
    await db.bookLists.delete(id);
    const links = await db.bookList.where("listId").equals(id).toArray();
    for (const l of links) if (l.id) await db.bookList.delete(l.id);
  });
}

/** Antal böcker per lista (nycklar som strängar). */
export async function getBookListCounts(): Promise<Record<string, number>> {
  const all = await db.bookList.toArray();
  const out: Record<string, number> = {};
  for (const x of all) {
    const k = String(x.listId);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export async function getBookListById(id: number) {
  return db.bookLists.get(id);
}

export async function getBooksInBookList(listId: number) {
  const links = await db.bookList.where("listId").equals(listId).toArray();
  const ids = links.map((x) => x.bookId);
  if (!ids.length) return [];
  return db.books.where("id").anyOf(ids).toArray();
}

export async function linkBookToList(listId: number, bookId: number) {
  const exists = await db.bookList.where({ listId, bookId }).first();
  if (!exists) await db.bookList.add({ listId, bookId } as any);
}

export async function unlinkBookFromList(listId: number, bookId: number) {
  const row = await db.bookList.where({ listId, bookId }).first();
  if (row?.id) await db.bookList.delete(row.id);
}

/* ---------- Spel: CRUD & sök ---------- */

export async function addGame(game: Omit<Game, "id" | "createdAt">) {
  const id = await db.games.add({ ...game, createdAt: Date.now() });
  return id;
}

export async function updateGame(id: number, patch: Partial<Game>) {
  await db.games.update(id, patch);
}

export async function deleteGame(id: number) {
  await db.games.delete(id);
}

export async function getGame(id: number) {
  return db.games.get(id);
}

export async function getGames() {
  return db.games.orderBy("createdAt").reverse().toArray();
}

export async function getRecentGames(limit = 20) {
  return db.games.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function searchGames(opts: {
  text?: string;
  platform?: string;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
}) {
  const { text, platform, owned, digital, wishlisted } = opts;
  let col = db.games.toCollection();

  if (owned !== undefined) col = col.filter((g) => !!g.owned === owned);
  if (digital !== undefined) col = col.filter((g) => !!g.digital === digital);
  if (wishlisted !== undefined) col = col.filter((g) => !!g.wishlisted === wishlisted);
  if (platform && platform.trim())
    col = col.filter((g) => (g.platform || "").toLowerCase() === platform.trim().toLowerCase());

  if (text && text.trim()) {
    const q = text.trim().toLowerCase();
    col = col.filter((g) => {
      if (g.title?.toLowerCase().includes(q)) return true;
      if (g.platform?.toLowerCase().includes(q)) return true;
      return false;
    });
  }

  return col.toArray();
}

/* ---------- Spellistor ---------- */

export async function createGameList(name: string) {
  return db.gameLists.add({ name: name.trim(), createdAt: Date.now() });
}

export async function getGameLists() {
  return db.gameLists.orderBy("createdAt").reverse().toArray();
}

export async function renameGameList(id: number, name: string) {
  await db.gameLists.update(id, { name: name.trim() });
}

export async function deleteGameList(id: number) {
  await db.transaction("rw", db.gameLists, db.gameList, async () => {
    await db.gameLists.delete(id);
    const links = await db.gameList.where("listId").equals(id).toArray();
    for (const l of links) if (l.id) await db.gameList.delete(l.id);
  });
}

/** Antal spel per lista (nycklar som strängar). */
export async function getGameListCounts(): Promise<Record<string, number>> {
  const all = await db.gameList.toArray();
  const out: Record<string, number> = {};
  for (const x of all) {
    const k = String(x.listId);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export async function getGameListById(id: number) {
  return db.gameLists.get(id);
}

export async function getGamesInGameList(listId: number) {
  const links = await db.gameList.where("listId").equals(listId).toArray();
  const ids = links.map((x) => x.gameId);
  if (!ids.length) return [];
  return db.games.where("id").anyOf(ids).toArray();
}

export async function linkGameToList(listId: number, gameId: number) {
  const exists = await db.gameList.where({ listId, gameId }).first();
  if (!exists) await db.gameList.add({ listId, gameId } as any);
}

export async function unlinkGameFromList(listId: number, gameId: number) {
  const row = await db.gameList.where({ listId, gameId }).first();
  if (row?.id) await db.gameList.delete(row.id);
}

/* ---------- Export / Import / Wipe ---------- */

export async function exportJson(): Promise<string> {
  const [
    movies, lists, links,
    books, bookLists, bookLinks,
    games, gameLists, gameLinks
  ] = await Promise.all([
    db.movies.toArray(),
    db.lists.toArray(),
    db.movieList.toArray(),
    db.books.toArray(),
    db.bookLists.toArray(),
    db.bookList.toArray(),
    db.games.toArray(),
    db.gameLists.toArray(),
    db.gameList.toArray(),
  ]);
  return JSON.stringify(
    { movies, lists, links, books, bookLists, bookLinks, games, gameLists, gameLinks },
    null, 2
  );
}

/** Exportera ett subset av filmer, med bara berörda listor/links. */
export async function exportSubset(opts: {
  owned?: boolean;
  wishlisted?: boolean;
  digital?: boolean;
  ids?: number[];
}) {
  const { owned, wishlisted, digital, ids } = opts;
  let col = db.movies.toCollection();

  if (ids?.length) {
    col = db.movies.where("id").anyOf(ids as number[]);
  } else {
    if (owned !== undefined) col = col.filter((m) => !!m.owned === owned);
    if (wishlisted !== undefined) col = col.filter((m) => !!m.wishlisted === wishlisted);
    if (digital !== undefined) col = col.filter((m) => !!m.digital === digital);
  }

  const movies = await col.toArray();

  // Endast länkar som rör dessa filmer
  const movieIds = new Set(movies.map(m => m.id!));
  const allLinks = await db.movieList.toArray();
  const links = allLinks.filter(l => movieIds.has(l.movieId));

  // Endast listor som förekommer i länkarna
  const listIds = new Set(links.map(l => l.listId));
  const lists = (await db.lists.toArray()).filter(l => listIds.has(l.id!));

  return JSON.stringify(
    { movies, lists, links, books: [], bookLists: [], bookLinks: [], games: [], gameLists: [], gameLinks: [] },
    null,
    2
  );
}

/**
 * Importera JSON-export (samtliga entiteter).
 * - Upsert-likt: försöker hitta befintligt (barcode, annars title+year)
 * - Lägger annars till nytt objekt (ignorerar inkommande id)
 * - Återskapar list-länkar via id-mappar
 * Returnerar counters för UI-feedback.
 */
export async function importJson(text: string) {
  const data = JSON.parse(text || "{}") as {
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

  const moviesIn = data.movies ?? [];
  const listsIn = data.lists ?? [];
  const linksIn = data.links ?? [];

  const booksIn = data.books ?? [];
  const bookListsIn = data.bookLists ?? [];
  const bookLinksIn = data.bookLinks ?? [];

  const gamesIn = data.games ?? [];
  const gameListsIn = data.gameLists ?? [];
  const gameLinksIn = data.gameLinks ?? [];

  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  await db.transaction(
    "rw",
    db.movies, db.lists, db.movieList,
    db.books, db.bookLists, db.bookList,
    db.games, db.gameLists, db.gameList,
    async () => {
      // ID-mappar från import-id -> lokalt id
      const movieIdMap = new Map<number, number>();
      const listIdMap = new Map<number, number>();
      const bookIdMap = new Map<number, number>();
      const bookListIdMap = new Map<number, number>();
      const gameIdMap = new Map<number, number>();
      const gameListIdMap = new Map<number, number>();

      // Helpers
      const findMovie = async (m: Movie) => {
        if (m.barcode) {
          const hit = await db.movies.where("barcode").equals(m.barcode).first();
          if (hit?.id) return hit.id;
        }
        const hit = await db.movies
          .filter(x => (x.title || "").toLowerCase() === (m.title || "").toLowerCase()
            && (x.year || 0) === (m.year || 0))
          .first();
        return hit?.id;
      };

      const findBook = async (b: Book) => {
        if (b.isbn) {
          const hit = await db.books.where("isbn").equals(b.isbn).first();
          if (hit?.id) return hit.id;
        }
        const hit = await db.books
          .filter(x => (x.title || "").toLowerCase() === (b.title || "").toLowerCase()
            && (x.author || "").toLowerCase() === (b.author || "").toLowerCase()
            && (x.year || 0) === (b.year || 0))
          .first();
        return hit?.id;
      };

      const findGame = async (g: Game) => {
        const hit = await db.games
          .filter(x => (x.title || "").toLowerCase() === (g.title || "").toLowerCase()
            && (x.platform || "").toLowerCase() === (g.platform || "").toLowerCase()
            && (x.year || 0) === (g.year || 0))
          .first();
        return hit?.id;
      };

      const getOrCreateList = async (name: string) => {
        const existing = await db.lists.where("name").equals(name).first();
        if (existing?.id) return existing.id;
        const id = await db.lists.add({ name, createdAt: Date.now() });
        addedLists++;
        return id;
      };

      const getOrCreateBookList = async (name: string) => {
        const existing = await db.bookLists.where("name").equals(name).first();
        if (existing?.id) return existing.id;
        const id = await db.bookLists.add({ name, createdAt: Date.now() });
        addedBookLists++;
        return id;
      };

      const getOrCreateGameList = async (name: string) => {
        const existing = await db.gameLists.where("name").equals(name).first();
        if (existing?.id) return existing.id;
        const id = await db.gameLists.add({ name, createdAt: Date.now() });
        addedGameLists++;
        return id;
      };

      // 1) Filmer
      for (const m of moviesIn) {
        const foundId = await findMovie(m);
        let localId = foundId;
        if (!localId) {
          const copy = { ...m };
          delete (copy as any).id;
          copy.createdAt = copy.createdAt || Date.now();
          localId = await db.movies.add(copy);
          addedMovies++;
        }
        movieIdMap.set(m.id!, localId!);
      }

      // 2) Film-listor
      for (const l of listsIn) {
        const localId = await getOrCreateList(l.name.trim());
        listIdMap.set(l.id!, localId);
      }

      // 3) Film-länkar
      for (const link of linksIn) {
        const movieLocal = movieIdMap.get(link.movieId);
        const listLocal = listIdMap.get(link.listId);
        if (!movieLocal || !listLocal) continue;
        const exists = await db.movieList.where({ movieId: movieLocal, listId: listLocal }).first();
        if (!exists) {
          await db.movieList.add({ movieId: movieLocal, listId: listLocal } as any);
          addedLinks++;
        }
      }

      // 4) Böcker
      for (const b of booksIn) {
        const foundId = await findBook(b);
        let localId = foundId;
        if (!localId) {
          const copy = { ...b };
          delete (copy as any).id;
          copy.createdAt = copy.createdAt || Date.now();
          localId = await db.books.add(copy);
          addedBooks++;
        }
        bookIdMap.set(b.id!, localId!);
      }

      // 5) Boklistor + länkar
      for (const l of bookListsIn) {
        const localId = await getOrCreateBookList(l.name.trim());
        bookListIdMap.set(l.id!, localId);
      }
      for (const link of bookLinksIn) {
        const bookLocal = bookIdMap.get(link.bookId);
        const listLocal = bookListIdMap.get(link.listId);
        if (!bookLocal || !listLocal) continue;
        const exists = await db.bookList.where({ bookId: bookLocal, listId: listLocal }).first();
        if (!exists) {
          await db.bookList.add({ bookId: bookLocal, listId: listLocal } as any);
          addedBookLinks++;
        }
      }

      // 6) Spel
      for (const g of gamesIn) {
        const foundId = await findGame(g);
        let localId = foundId;
        if (!localId) {
          const copy = { ...g };
          delete (copy as any).id;
          copy.createdAt = copy.createdAt || Date.now();
          localId = await db.games.add(copy);
          addedGames++;
        }
        gameIdMap.set(g.id!, localId!);
      }

      // 7) Spellistor + länkar
      for (const l of gameListsIn) {
        const localId = await getOrCreateGameList(l.name.trim());
        gameListIdMap.set(l.id!, localId);
      }
      for (const link of gameLinksIn) {
        const gameLocal = gameIdMap.get(link.gameId);
        const listLocal = gameListIdMap.get(link.listId);
        if (!gameLocal || !listLocal) continue;
        const exists = await db.gameList.where({ gameId: gameLocal, listId: listLocal }).first();
        if (!exists) {
          await db.gameList.add({ gameId: gameLocal, listId: listLocal } as any);
          addedGameLinks++;
        }
      }
    }
  );

  return {
    addedMovies, addedLists, addedLinks,
    addedBooks, addedBookLists, addedBookLinks,
    addedGames, addedGameLists, addedGameLinks,
  };
}

/** Töm allt lokalt innehåll (appens DB-struktur ligger kvar). */
export async function wipeAll() {
  await db.transaction(
    "rw",
    db.movies, db.lists, db.movieList,
    db.books, db.bookLists, db.bookList,
    db.games, db.gameLists, db.gameList,
    async () => {
      await db.movieList.clear();
      await db.lists.clear();
      await db.movies.clear();

      await db.bookList.clear();
      await db.bookLists.clear();
      await db.books.clear();

      await db.gameList.clear();
      await db.gameLists.clear();
      await db.games.clear();
    }
  );
}