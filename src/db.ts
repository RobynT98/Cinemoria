// src/db.ts
import Dexie, { Table } from "dexie";
import type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
  BookFormat, Format
} from "./types";

/** Re-exportera typer så komponenter kan göra `import type { Movie } from "@/db"` */
export type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
  BookFormat, Format
} from "./types";

/* ============================================================
   Dexie DB – behåller namn & tabeller för att inte tappa data
   ============================================================ */

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
    // Viktigt: Samma namn som tidigare för att återanvända befintlig data
    super("cinemoria");

    // Behåll exakt samma index-strängar som version 8 i din tidigare DB
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

/* ============================================================
   Filmer – CRUD & helpers
   ============================================================ */

export async function addMovie(movie: Omit<Movie, "id" | "createdAt">) {
  const now = Date.now();
  return db.movies.add({ ...movie, createdAt: now });
}

export async function updateMovie(id: number, patch: Partial<Movie>) {
  await db.movies.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteMovie(id: number) {
  await db.transaction("rw", [db.movies, db.movieList], async () => {
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
  await db.movies.update(id, { seen, updatedAt: Date.now() });
}

export async function setRating(id: number, rating?: number) {
  await db.movies.update(id, { rating, updatedAt: Date.now() });
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
      if (m.location?.toLowerCase().includes(q)) return true;
      if (m.provider?.toLowerCase().includes(q)) return true;
      return false;
    });
  }

  return col.toArray();
}

/* ---------- Film-listor ---------- */

export async function createList(name: string) {
  return db.lists.add({ name: name.trim(), createdAt: Date.now() });
}

export async function getLists() {
  return db.lists.orderBy("createdAt").reverse().toArray();
}

export async function renameList(id: number, name: string) {
  await db.lists.update(id, { name: name.trim() });
}

export async function deleteList(id: number) {
  await db.transaction("rw", [db.lists, db.movieList], async () => {
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
  if (!exists) await db.movieList.add({ listId, movieId, createdAt: Date.now() } as any);
}

export async function unlinkMovieFromList(listId: number, movieId: number) {
  const row = await db.movieList.where({ listId, movieId }).first();
  if (row?.id) await db.movieList.delete(row.id);
}

/* ============================================================
   Böcker – CRUD & sök
   ============================================================ */

export async function addBook(book: Omit<Book, "id" | "createdAt">) {
  const now = Date.now();
  return db.books.add({ ...book, createdAt: now });
}

export async function updateBook(id: number, patch: Partial<Book>) {
  await db.books.update(id, { ...patch, updatedAt: Date.now() });
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
    col = col.filter(
      (b) => (b.language || "").toLowerCase() === language.trim().toLowerCase()
    );

  if (text && text.trim()) {
    const q = text.trim().toLowerCase();
    col = col.filter((b) => {
      if (b.title?.toLowerCase().includes(q)) return true;
      if (b.author?.toLowerCase().includes(q)) return true;
      if (b.genres?.some((g) => g.toLowerCase().includes(q))) return true;
      if (b.isbn?.toLowerCase().includes(q)) return true;
      if (b.publisher?.toLowerCase().includes(q)) return true;
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
  await db.transaction("rw", [db.bookLists, db.bookList], async () => {
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
  if (!exists) await db.bookList.add({ listId, bookId, createdAt: Date.now() } as any);
}

export async function unlinkBookFromList(listId: number, bookId: number) {
  const row = await db.bookList.where({ listId, bookId }).first();
  if (row?.id) await db.bookList.delete(row.id);
}

/* ============================================================
   Spel – CRUD & sök
   ============================================================ */

export async function addGame(game: Omit<Game, "id" | "createdAt">) {
  return db.games.add({ ...game, createdAt: Date.now() });
}

export async function updateGame(id: number, patch: Partial<Game>) {
  await db.games.update(id, { ...patch, updatedAt: Date.now() });
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
    col = col.filter(
      (g) => (g.platform || "").toLowerCase() === platform.trim().toLowerCase()
    );

  if (text && text.trim()) {
    const q = text.trim().toLowerCase();
    col = col.filter((g) => {
      if (g.title?.toLowerCase().includes(q)) return true;
      if (g.platform?.toLowerCase().includes(q)) return true;
      if (g.notes?.toLowerCase().includes(q)) return true;
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
  await db.transaction("rw", [db.gameLists, db.gameList], async () => {
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
  if (!exists) await db.gameList.add({ listId, gameId, createdAt: Date.now() } as any);
}

export async function unlinkGameFromList(listId: number, gameId: number) {
  const row = await db.gameList.where({ listId, gameId }).first();
  if (row?.id) await db.gameList.delete(row.id);
}

/* ============================================================
   Export / Import / Wipe
   ============================================================ */

// Full export för backup
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
    null,
    2
  );
}

// Import med enkla räknare (används i ProfilePage)
export async function importJson(json: string) {
  const data = JSON.parse(json || "{}");

  const movies: Movie[] = data.movies ?? [];
  const lists: List[] = data.lists ?? [];
  const links: MovieListLink[] = data.links ?? [];

  const books: Book[] = data.books ?? [];
  const bookLists: BookList[] = data.bookLists ?? [];
  const bookLinks: BookListLink[] = data.bookLinks ?? [];

  const games: Game[] = data.games ?? [];
  const gameLists: GameList[] = data.gameLists ?? [];
  const gameLinks: GameListLink[] = data.gameLinks ?? [];

  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  await db.transaction("rw", [
    db.movies, db.lists, db.movieList,
    db.books, db.bookLists, db.bookList,
    db.games, db.gameLists, db.gameList
  ], async () => {
    // put = upsert (bevarar id om möjligt)
    if (movies.length) {
      await db.movies.bulkPut(movies);
      addedMovies = movies.length;
    }
    if (lists.length) {
      await db.lists.bulkPut(lists);
      addedLists = lists.length;
    }
    if (links.length) {
      await db.movieList.bulkPut(links);
      addedLinks = links.length;
    }

    if (books.length) {
      await db.books.bulkPut(books);
      addedBooks = books.length;
    }
    if (bookLists.length) {
      await db.bookLists.bulkPut(bookLists);
      addedBookLists = bookLists.length;
    }
    if (bookLinks.length) {
      await db.bookList.bulkPut(bookLinks);
      addedBookLinks = bookLinks.length;
    }

    if (games.length) {
      await db.games.bulkPut(games);
      addedGames = games.length;
    }
    if (gameLists.length) {
      await db.gameLists.bulkPut(gameLists);
      addedGameLists = gameLists.length;
    }
    if (gameLinks.length) {
      await db.gameList.bulkPut(gameLinks);
      addedGameLinks = gameLinks.length;
    }
  });

  return {
    addedMovies, addedLists, addedLinks,
    addedBooks, addedBookLists, addedBookLinks,
    addedGames, addedGameLists, addedGameLinks,
  };
}

// Rensa allt (används i ProfilePage)
export async function wipeAll() {
  await db.transaction("rw", [
    db.movies, db.lists, db.movieList,
    db.books, db.bookLists, db.bookList,
    db.games, db.gameLists, db.gameList,
  ], async () => {
    await Promise.all([
      db.movies.clear(),
      db.lists.clear(),
      db.movieList.clear(),

      db.books.clear(),
      db.bookLists.clear(),
      db.bookList.clear(),

      db.games.clear(),
      db.gameLists.clear(),
      db.gameList.clear(),
    ]);
  });
}