// src/db.ts
import Dexie, { type Table } from "dexie";
import type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
} from "@/types";

// Re-exportera alla typer så resten av appen kan importera från "@/db"
export type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
} from "@/types";

/* ────────────────────────────────────────────────────────────
   Dexie DB
   - Viktigt: tabellnamn matchar backup.ts (movieList/bookList/gameList)
──────────────────────────────────────────────────────────── */
export class CinemoriaDB extends Dexie {
  // Film
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieListLink, number>; // länkar film<->lista

  // Böcker
  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookList!: Table<BookListLink, number>;   // länkar bok<->lista

  // Spel
  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameList!: Table<GameListLink, number>;   // länkar spel<->lista

  constructor() {
    super("CinemoriaDB");

    this.version(4).stores({
      // Film
      movies: "++id, title, owned, wishlisted, digital, createdAt, updatedAt",
      lists: "++id, name, createdAt, updatedAt",
      movieList: "++id, movieId, listId, createdAt",

      // Böcker
      books: "++id, title, author, owned, wishlisted, digital, createdAt, updatedAt",
      bookLists: "++id, name, createdAt, updatedAt",
      bookList: "++id, bookId, listId, createdAt",

      // Spel
      games: "++id, title, platform, owned, wishlisted, digital, createdAt, updatedAt",
      gameLists: "++id, name, createdAt, updatedAt",
      gameList: "++id, gameId, listId, createdAt",
    });
  }
}

export const db = new CinemoriaDB();

/* ────────────────────────────────────────────────────────────
   Film: CRUD
──────────────────────────────────────────────────────────── */
export async function addMovie(m: Movie) {
  const now = Date.now();
  return db.movies.add({ ...m, createdAt: m.createdAt ?? now, updatedAt: now });
}
export const getMovie = (id: number) => db.movies.get(id);
export const updateMovie = (id: number, patch: Partial<Movie>) =>
  db.movies.update(id, { ...patch, updatedAt: Date.now() });
export async function deleteMovie(id: number) {
  await db.movieList.where("movieId").equals(id).delete();
  await db.movies.delete(id);
}

/* ────────────────────────────────────────────────────────────
   Film: Listor
──────────────────────────────────────────────────────────── */
export const createList = (name: string) =>
  db.lists.add({ name, createdAt: Date.now(), updatedAt: Date.now() });

export const renameList = (id: number, name: string) =>
  db.lists.update(id, { name, updatedAt: Date.now() });

export async function deleteList(id: number) {
  await db.movieList.where("listId").equals(id).delete();
  await db.lists.delete(id);
}

export const getLists = () => db.lists.orderBy("createdAt").reverse().toArray();
export const getListById = (id: number) => db.lists.get(id);

export async function linkMovieToList(movieId: number, listId: number) {
  const exists = await db.movieList.where({ movieId, listId }).first();
  if (!exists) await db.movieList.add({ movieId, listId, createdAt: Date.now() });
}
export const unlinkMovieFromList = (movieId: number, listId: number) =>
  db.movieList.where({ movieId, listId }).delete();

export async function getMoviesInList(listId: number) {
  const lns = await db.movieList.where("listId").equals(listId).toArray();
  const ids = lns.map(l => l.movieId);
  return ids.length ? db.movies.where("id").anyOf(ids).toArray() : [];
}
export async function getListCounts() {
  const lists = await db.lists.toArray();
  const out: Record<number, number> = {};
  for (const l of lists) {
    out[l.id!] = await db.movieList.where("listId").equals(l.id!).count();
  }
  return out;
}
// alias om någon sida förväntar sig detta namn
export const getMovieListCounts = getListCounts;

/* ────────────────────────────────────────────────────────────
   Böcker: CRUD
──────────────────────────────────────────────────────────── */
export async function addBook(b: Book) {
  const now = Date.now();
  return db.books.add({ ...b, createdAt: b.createdAt ?? now, updatedAt: now });
}
export const getBook = (id: number) => db.books.get(id);
export const updateBook = (id: number, patch: Partial<Book>) =>
  db.books.update(id, { ...patch, updatedAt: Date.now() });
export async function deleteBook(id: number) {
  await db.bookList.where("bookId").equals(id).delete();
  await db.books.delete(id);
}

/* ────────────────────────────────────────────────────────────
   Böcker: Listor
──────────────────────────────────────────────────────────── */
export const createBookList = (name: string) =>
  db.bookLists.add({ name, createdAt: Date.now(), updatedAt: Date.now() });

export const renameBookList = (id: number, name: string) =>
  db.bookLists.update(id, { name, updatedAt: Date.now() });

export async function deleteBookList(id: number) {
  await db.bookList.where("listId").equals(id).delete();
  await db.bookLists.delete(id);
}

export const getBookLists = () =>
  db.bookLists.orderBy("createdAt").reverse().toArray();

export const getBookListById = (id: number) => db.bookLists.get(id);

export async function linkBookToList(bookId: number, listId: number) {
  const exists = await db.bookList.where({ bookId, listId }).first();
  if (!exists) await db.bookList.add({ bookId, listId, createdAt: Date.now() });
}
export const unlinkBookFromList = (bookId: number, listId: number) =>
  db.bookList.where({ bookId, listId }).delete();

export async function getBooksInBookList(listId: number) {
  const lns = await db.bookList.where("listId").equals(listId).toArray();
  const ids = lns.map(l => l.bookId);
  return ids.length ? db.books.where("id").anyOf(ids).toArray() : [];
}
export async function getBookListCounts() {
  const lists = await db.bookLists.toArray();
  const out: Record<number, number> = {};
  for (const l of lists) {
    out[l.id!] = await db.bookList.where("listId").equals(l.id!).count();
  }
  return out;
}

/* ────────────────────────────────────────────────────────────
   Spel: CRUD
──────────────────────────────────────────────────────────── */
export async function addGame(g: Game) {
  const now = Date.now();
  return db.games.add({ ...g, createdAt: g.createdAt ?? now, updatedAt: now });
}
export const getGame = (id: number) => db.games.get(id);
export const updateGame = (id: number, patch: Partial<Game>) =>
  db.games.update(id, { ...patch, updatedAt: Date.now() });
export async function deleteGame(id: number) {
  await db.gameList.where("gameId").equals(id).delete();
  await db.games.delete(id);
}

/* ────────────────────────────────────────────────────────────
   Spel: Listor
──────────────────────────────────────────────────────────── */
export const createGameList = (name: string) =>
  db.gameLists.add({ name, createdAt: Date.now(), updatedAt: Date.now() });

export const renameGameList = (id: number, name: string) =>
  db.gameLists.update(id, { name, updatedAt: Date.now() });

export async function deleteGameList(id: number) {
  await db.gameList.where("listId").equals(id).delete();
  await db.gameLists.delete(id);
}

export const getGameLists = () =>
  db.gameLists.orderBy("createdAt").reverse().toArray();

export const getGameListById = (id: number) => db.gameLists.get(id);

export async function linkGameToList(gameId: number, listId: number) {
  const exists = await db.gameList.where({ gameId, listId }).first();
  if (!exists) await db.gameList.add({ gameId, listId, createdAt: Date.now() });
}
export const unlinkGameFromList = (gameId: number, listId: number) =>
  db.gameList.where({ gameId, listId }).delete();

export async function getGamesInGameList(listId: number) {
  const lns = await db.gameList.where("listId").equals(listId).toArray();
  const ids = lns.map(l => l.gameId);
  return ids.length ? db.games.where("id").anyOf(ids).toArray() : [];
}
export async function getGameListCounts() {
  const lists = await db.gameLists.toArray();
  const out: Record<number, number> = {};
  for (const l of lists) {
    out[l.id!] = await db.gameList.where("listId").equals(l.id!).count();
  }
  return out;
}