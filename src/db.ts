// src/db.ts
import Dexie, { Table } from "dexie";

/* ===========================================================
   TYPER
=========================================================== */
export type List = {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type MovieFormat = "uhd" | "bluray" | "dvd" | "digital" | "vhs" | "other";
export type Movie = {
  id?: number;
  title: string;
  year?: number;
  genres?: string[];
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  format?: MovieFormat;
  region?: string;
  standard?: string;
  barcode?: string;
  edition?: string;
  audio?: string;
  location?: string;
  rating?: number;
  notes?: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
};

export type MovieListLink = {
  id?: number;
  movieId: number;
  listId: number;
  createdAt: number;
};

export type BookFormat = "paperback" | "hardcover" | "ebook" | "audiobook" | "other";
export type Book = {
  id?: number;
  title: string;
  author?: string;
  year?: number;
  genres?: string[];
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  format?: BookFormat;
  language?: string;
  isbn?: string;
  pages?: number;
  publisher?: string;
  location?: string;
  rating?: number;
  notes?: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
};

export type BookList = {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type BookListLink = {
  id?: number;
  bookId: number;
  listId: number;
  createdAt: number;
};

export type Game = {
  id?: number;
  title: string;
  platform?: string; // PS5, Switch, PC, …
  year?: number;
  owned?: boolean;
  digital?: boolean;
  wishlisted?: boolean;
  rating?: number;
  notes?: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
};

export type GameList = {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type GameListLink = {
  id?: number;
  gameId: number;
  listId: number;
  createdAt: number;
};

/* ===========================================================
   DB
=========================================================== */
export class CinemoriaDB extends Dexie {
  // tabeller
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
    super("CinemoriaDB");

    // v1 – grundschema
    this.version(1).stores({
      movies: "++id,title,createdAt,updatedAt",
      lists: "++id,name,createdAt,updatedAt",
      movieList: "++id,movieId,listId,createdAt",

      books: "++id,title,author,createdAt,updatedAt",
      bookLists: "++id,name,createdAt,updatedAt",
      bookList: "++id,bookId,listId,createdAt",

      games: "++id,title,platform,createdAt,updatedAt",
      gameLists: "++id,name,createdAt,updatedAt",
      gameList: "++id,gameId,listId,createdAt",
    });
  }
}

export const db = new CinemoriaDB();

/* ===========================================================
   HJÄLPFUNKTIONER – CREATE
=========================================================== */
export async function addMovie(partial: Partial<Movie> & { title: string }) {
  const now = Date.now();
  return db.movies.add({
    genres: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  } as Movie);
}

export async function addBook(partial: Partial<Book> & { title: string }) {
  const now = Date.now();
  return db.books.add({
    genres: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  } as Book);
}

export async function addGame(partial: Partial<Game> & { title: string }) {
  const now = Date.now();
  return db.games.add({
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  } as Game);
}

/* ===========================================================
   HJÄLPFUNKTIONER – BOKLISTOR
   (Används i vissa av dina sidor – behåller för kompatibilitet)
=========================================================== */
export async function getBookListById(id: number) {
  return db.bookLists.get(id);
}
export async function getBooksInBookList(listId: number) {
  const links = await db.bookList.where("listId").equals(listId).toArray();
  const ids = new Set<number>(links.map((l) => Number(l.bookId)));
  const all = await db.books.toArray();
  return all.filter((b) => typeof b.id === "number" && ids.has(Number(b.id)));
}
export async function linkBookToList(listId: number, bookId: number) {
  const exists = await db.bookList.where({ listId, bookId }).first();
  if (!exists) await db.bookList.add({ listId, bookId, createdAt: Date.now() } as BookListLink);
}
export async function unlinkBookFromList(listId: number, bookId: number) {
  const link = await db.bookList.where({ listId, bookId }).first();
  if ((link as any)?.id) await db.bookList.delete((link as any).id);
}
export async function renameBookList(listId: number, name: string) {
  await db.bookLists.update(listId, { name, updatedAt: Date.now() });
}
export async function deleteBookList(listId: number) {
  const links = await db.bookList.where("listId").equals(listId).toArray();
  await db.transaction("rw", [db.bookList, db.bookLists], async () => {
    for (const ln of links) if ((ln as any).id) await db.bookList.delete((ln as any).id);
    await db.bookLists.delete(listId);
  });
}

/* ===========================================================
   HJÄLPFUNKTIONER – SPELLISTOR
=========================================================== */
export async function getGameListById(id: number) {
  return db.gameLists.get(id);
}
export async function getGamesInGameList(listId: number) {
  const links = await db.gameList.where("listId").equals(listId).toArray();
  const ids = new Set<number>(links.map((l) => Number(l.gameId)));
  const all = await db.games.toArray();
  return all.filter((g) => typeof g.id === "number" && ids.has(Number(g.id)));
}
export async function linkGameToList(listId: number, gameId: number) {
  const exists = await db.gameList.where({ listId, gameId }).first();
  if (!exists) await db.gameList.add({ listId, gameId, createdAt: Date.now() } as GameListLink);
}
export async function unlinkGameFromList(listId: number, gameId: number) {
  const link = await db.gameList.where({ listId, gameId }).first();
  if ((link as any)?.id) await db.gameList.delete((link as any).id);
}
export async function renameGameList(listId: number, name: string) {
  await db.gameLists.update(listId, { name, updatedAt: Date.now() });
}
export async function deleteGameList(listId: number) {
  const links = await db.gameList.where("listId").equals(listId).toArray();
  await db.transaction("rw", [db.gameList, db.gameLists], async () => {
    for (const ln of links) if ((ln as any).id) await db.gameList.delete((ln as any).id);
    await db.gameLists.delete(listId);
  });
}