// src/db.ts
import Dexie, { type Table } from "dexie";
import type {
  Movie,
  Book,
  Game,
  List,
  MovieListLink,
  BookList,
  BookListLink,
  GameList,
  GameListLink,
} from "@/types";

// Re-export types so pages can keep importing from "@/db"
export type {
  Movie,
  Book,
  Game,
  List,
  MovieListLink,
  BookList,
  BookListLink,
  GameList,
  GameListLink,
  MovieStatus,
  RegionCode,
  VideoStandard,
  Format,
  BookFormat,
  GamePlatform,
  GameFormat,
  GameStatus,
} from "@/types";

/* =========================
   Dexie DB
========================= */
class AppDB extends Dexie {
  movies!: Table<Movie, number>;
  books!: Table<Book, number>;
  games!: Table<Game, number>;

  // Generic (old) lists used for movies
  lists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  // Dedicated lists per media type
  bookLists!: Table<BookList, number>;
  bookListLinks!: Table<BookListLink, number>;

  gameLists!: Table<GameList, number>;
  gameListLinks!: Table<GameListLink, number>;

  constructor() {
    super("cinemoria");

    this.version(1).stores({
      movies: "++id, title, createdAt, owned, digital, wishlisted, barcode",
      books:  "++id, title, createdAt, owned, digital, wishlisted, isbn",
      games:  "++id, title, createdAt, owned, digital, wishlisted, barcode",

      // Movie lists (legacy/shared)
      lists:           "++id, name, createdAt",
      movieListLinks:  "++id, listId, movieId, createdAt",

      // Book lists
      bookLists:       "++id, name, createdAt",
      bookListLinks:   "++id, listId, bookId, createdAt",

      // Game lists
      gameLists:       "++id, name, createdAt",
      gameListLinks:   "++id, listId, gameId, createdAt",
    });

    this.movies = this.table("movies");
    this.books = this.table("books");
    this.games = this.table("games");

    this.lists = this.table("lists");
    this.movieListLinks = this.table("movieListLinks");

    this.bookLists = this.table("bookLists");
    this.bookListLinks = this.table("bookListLinks");

    this.gameLists = this.table("gameLists");
    this.gameListLinks = this.table("gameListLinks");
  }
}

export const db = new AppDB();

/* =========================
   MOVIES – CRUD
========================= */
export async function addMovie(data: Movie): Promise<number> {
  const now = Date.now();
  return db.movies.add({ ...data, createdAt: data.createdAt ?? now, updatedAt: now });
}
export async function getMovie(id: number) { return db.movies.get(id); }
export async function updateMovie(id: number, patch: Partial<Movie>) {
  await db.movies.update(id, { ...patch, updatedAt: Date.now() });
}
export async function deleteMovie(id: number) {
  await db.transaction("rw", db.movieListLinks, db.movies, async () => {
    await db.movieListLinks.where({ movieId: id }).delete();
    await db.movies.delete(id);
  });
}

/* =========================
   BOOKS – CRUD
========================= */
export async function addBook(data: Book): Promise<number> {
  const now = Date.now();
  return db.books.add({ ...data, createdAt: data.createdAt ?? now, updatedAt: now });
}
export async function getBook(id: number) { return db.books.get(id); }
export async function updateBook(id: number, patch: Partial<Book>) {
  await db.books.update(id, { ...patch, updatedAt: Date.now() });
}
export async function deleteBook(id: number) {
  await db.transaction("rw", db.bookListLinks, db.books, async () => {
    await db.bookListLinks.where({ bookId: id }).delete();
    await db.books.delete(id);
  });
}

/* =========================
   GAMES – CRUD
========================= */
export async function addGame(data: Game): Promise<number> {
  const now = Date.now();
  return db.games.add({ ...data, createdAt: data.createdAt ?? now, updatedAt: now });
}
export async function getGame(id: number) { return db.games.get(id); }
export async function updateGame(id: number, patch: Partial<Game>) {
  await db.games.update(id, { ...patch, updatedAt: Date.now() });
}
export async function deleteGame(id: number) {
  await db.transaction("rw", db.gameListLinks, db.games, async () => {
    await db.gameListLinks.where({ gameId: id }).delete();
    await db.games.delete(id);
  });
}

/* =========================
   MOVIE LISTS
========================= */
export async function getLists(): Promise<List[]> {
  return db.lists.orderBy("createdAt").reverse().toArray();
}
export async function createList(name: string) {
  const now = Date.now();
  return db.lists.add({ name, createdAt: now, updatedAt: now });
}
export async function renameList(id: number, name: string) {
  await db.lists.update(id, { name, updatedAt: Date.now() });
}
export async function deleteList(id: number) {
  await db.transaction("rw", db.movieListLinks, db.lists, async () => {
    await db.movieListLinks.where({ listId: id }).delete();
    await db.lists.delete(id);
  });
}
export async function getListById(id: number) { return db.lists.get(id); }
export async function linkMovieToList(movieId: number, listId: number) {
  const exists = await db.movieListLinks.where({ movieId, listId }).first();
  if (!exists) await db.movieListLinks.add({ movieId, listId, createdAt: Date.now() });
}
export async function unlinkMovieFromList(movieId: number, listId: number) {
  const links = await db.movieListLinks.where({ movieId, listId }).toArray();
  if (links.length) await db.movieListLinks.bulkDelete(links.map(l => l.id!));
}
export async function isMovieInList(movieId: number, listId: number) {
  return !!(await db.movieListLinks.where({ movieId, listId }).first());
}
export async function getListCounts(): Promise<Record<string, number>> {
  const all = await db.movieListLinks.toArray();
  return all.reduce<Record<string, number>>((m, l) => {
    const k = String(l.listId);
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}
export async function getMoviesInList(listId: number): Promise<Movie[]> {
  const links = await db.movieListLinks.where("listId").equals(listId).reverse().sortBy("createdAt");
  const ids = links.map(l => l.movieId);
  if (!ids.length) return [];
  const items = (await db.movies.bulkGet(ids)).filter(Boolean) as Movie[];
  const order = new Map<number, number>(); ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}

/* =========================
   BOOK LISTS
========================= */
export async function getBookLists(): Promise<BookList[]> {
  return db.bookLists.orderBy("createdAt").reverse().toArray();
}
export async function createBookList(name: string) {
  const now = Date.now();
  return db.bookLists.add({ name, createdAt: now, updatedAt: now });
}
export async function renameBookList(id: number, name: string) {
  await db.bookLists.update(id, { name, updatedAt: Date.now() });
}
export async function deleteBookList(id: number) {
  await db.transaction("rw", db.bookListLinks, db.bookLists, async () => {
    await db.bookListLinks.where({ listId: id }).delete();
    await db.bookLists.delete(id);
  });
}
export async function getBookListById(id: number) { return db.bookLists.get(id); }
export async function linkBookToList(bookId: number, listId: number) {
  const exists = await db.bookListLinks.where({ bookId, listId }).first();
  if (!exists) await db.bookListLinks.add({ bookId, listId, createdAt: Date.now() });
}
export async function unlinkBookFromList(bookId: number, listId: number) {
  const links = await db.bookListLinks.where({ bookId, listId }).toArray();
  if (links.length) await db.bookListLinks.bulkDelete(links.map(l => l.id!));
}
export async function isBookInList(bookId: number, listId: number) {
  return !!(await db.bookListLinks.where({ bookId, listId }).first());
}
export async function getBookListCounts(): Promise<Record<string, number>> {
  const all = await db.bookListLinks.toArray();
  return all.reduce<Record<string, number>>((m, l) => {
    const k = String(l.listId);
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}
export async function getBooksInList(listId: number): Promise<Book[]> {
  const links = await db.bookListLinks.where("listId").equals(listId).reverse().sortBy("createdAt");
  const ids = links.map(l => l.bookId);
  if (!ids.length) return [];
  const items = (await db.books.bulkGet(ids)).filter(Boolean) as Book[];
  const order = new Map<number, number>(); ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}

/* =========================
   GAME LISTS
========================= */
export async function getGameLists(): Promise<GameList[]> {
  return db.gameLists.orderBy("createdAt").reverse().toArray();
}
export async function createGameList(name: string) {
  const now = Date.now();
  return db.gameLists.add({ name, createdAt: now, updatedAt: now });
}
export async function renameGameList(id: number, name: string) {
  await db.gameLists.update(id, { name, updatedAt: Date.now() });
}
export async function deleteGameList(id: number) {
  await db.transaction("rw", db.gameListLinks, db.gameLists, async () => {
    await db.gameListLinks.where({ listId: id }).delete();
    await db.gameLists.delete(id);
  });
}
export async function getGameListById(id: number) { return db.gameLists.get(id); }
export async function linkGameToList(gameId: number, listId: number) {
  const exists = await db.gameListLinks.where({ gameId, listId }).first();
  if (!exists) await db.gameListLinks.add({ gameId, listId, createdAt: Date.now() });
}
export async function unlinkGameFromList(gameId: number, listId: number) {
  const links = await db.gameListLinks.where({ gameId, listId }).toArray();
  if (links.length) await db.gameListLinks.bulkDelete(links.map(l => l.id!));
}
export async function isGameInList(gameId: number, listId: number) {
  return !!(await db.gameListLinks.where({ gameId, listId }).first());
}
export async function getGameListCounts(): Promise<Record<string, number>> {
  const all = await db.gameListLinks.toArray();
  return all.reduce<Record<string, number>>((m, l) => {
    const k = String(l.listId);
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}
export async function getGamesInList(listId: number): Promise<Game[]> {
  const links = await db.gameListLinks.where("listId").equals(listId).reverse().sortBy("createdAt");
  const ids = links.map(l => l.gameId);
  if (!ids.length) return [];
  const items = (await db.games.bulkGet(ids)).filter(Boolean) as Game[];
  const order = new Map<number, number>(); ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}

/* =========================
   Utility
========================= */
export async function clearAll(): Promise<void> {
  await db.transaction(
    "rw",
    db.movies, db.books, db.games,
    db.lists, db.movieListLinks,
    db.bookLists, db.bookListLinks,
    db.gameLists, db.gameListLinks,
    async () => {
      await Promise.all([
        db.movies.clear(),
        db.books.clear(),
        db.games.clear(),
        db.lists.clear(),
        db.movieListLinks.clear(),
        db.bookLists.clear(),
        db.bookListLinks.clear(),
        db.gameLists.clear(),
        db.gameListLinks.clear(),
      ]);
    }
  );
}