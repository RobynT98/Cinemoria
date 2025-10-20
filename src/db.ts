// src/db.ts
import Dexie, { Table } from "dexie";
import {
  type Movie,
  type List,
  type MovieListLink,
  type Book,
  type BookList,
  type BookListLink,
  type Game,
  type GameList,
  type GameListLink,
} from "./types";

export class CinemoriaDB extends Dexie {
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookListLinks!: Table<BookListLink, number>;

  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameListLinks!: Table<GameListLink, number>;

  constructor() {
    super("CinemoriaDB");

    this.version(1).stores({
      // Film
      movies:
        "++id, title, year, owned, wishlisted, digital, format, createdAt, barcode",
      lists: "++id, name, createdAt",
      movieListLinks: "++id, movieId, listId",

      // Böcker
      books:
        "++id, title, author, year, owned, wishlisted, digital, format, createdAt, isbn",
      bookLists: "++id, name, createdAt",
      bookListLinks: "++id, bookId, listId",

      // Spel
      games:
        "++id, title, year, platform, owned, wishlisted, digital, createdAt, barcode",
      gameLists: "++id, name, createdAt",
      gameListLinks: "++id, gameId, listId",
    });
  }
}

export const db = new CinemoriaDB();

/* ────────────────────────────────────────────────────────────
   FILM – listor & länkar
────────────────────────────────────────────────────────────── */
export async function createList(name: string): Promise<number> {
  const now = Date.now();
  return db.lists.add({ name, createdAt: now });
}
export async function renameList(id: number, name: string): Promise<void> {
  await db.lists.update(id, { name });
}
export async function deleteList(id: number): Promise<void> {
  await db.transaction("rw", db.lists, db.movieListLinks, async () => {
    await db.movieListLinks.where({ listId: id }).delete();
    await db.lists.delete(id);
  });
}
export async function getLists(): Promise<List[]> {
  return db.lists.orderBy("createdAt").reverse().toArray();
}
export async function getListById(id: number): Promise<List | undefined> {
  return db.lists.get(id);
}
export async function getListCounts(): Promise<Record<string, number>> {
  const links = await db.movieListLinks.toArray();
  const counts: Record<string, number> = {};
  for (const l of links) {
    const k = String(l.listId);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}
export async function linkMovieToList(movieId: number, listId: number) {
  const exists = await db.movieListLinks
    .where({ movieId, listId })
    .first();
  if (!exists) await db.movieListLinks.add({ movieId, listId });
}
export async function unlinkMovieFromList(movieId: number, listId: number) {
  await db.movieListLinks.where({ movieId, listId }).delete();
}
export async function getMoviesInList(listId: number): Promise<Movie[]> {
  const links = await db.movieListLinks.where({ listId }).toArray();
  const ids = links.map((l) => l.movieId);
  if (!ids.length) return [];
  return db.movies.where("id").anyOf(ids).toArray();
}

/* ────────────────────────────────────────────────────────────
   BACKUP / IMPORT / WIPE (alla domäner)
────────────────────────────────────────────────────────────── */
export async function exportJson(): Promise<string> {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    movies: await db.movies.toArray(),
    lists: await db.lists.toArray(),
    movieListLinks: await db.movieListLinks.toArray(),

    books: await db.books.toArray(),
    bookLists: await db.bookLists.toArray(),
    bookListLinks: await db.bookListLinks.toArray(),

    games: await db.games.toArray(),
    gameLists: await db.gameLists.toArray(),
    gameListLinks: await db.gameListLinks.toArray(),
  };
  return JSON.stringify(payload, null, 2);
}

export async function importJson(json: string): Promise<{
  addedMovies: number;
  addedLists: number;
  addedLinks: number;

  addedBooks: number;
  addedBookLists: number;
  addedBookLinks: number;

  addedGames: number;
  addedGameLists: number;
  addedGameLinks: number;
}> {
  const data = JSON.parse(json) ?? {};
  let addedMovies = 0,
    addedLists = 0,
    addedLinks = 0,
    addedBooks = 0,
    addedBookLists = 0,
    addedBookLinks = 0,
    addedGames = 0,
    addedGameLists = 0,
    addedGameLinks = 0;

  await db.transaction(
    "rw",
    db.movies,
    db.lists,
    db.movieListLinks,
    db.books,
    db.bookLists,
    db.bookListLinks,
    db.games,
    db.gameLists,
    db.gameListLinks,
    async () => {
      // Film
      if (Array.isArray(data.movies)) {
        addedMovies = await db.movies.bulkAdd(data.movies, { allKeys: false }).catch(() => 0).then((_) => data.movies.length);
      }
      if (Array.isArray(data.lists)) {
        addedLists = await db.lists.bulkAdd(data.lists).catch(() => 0).then((_) => data.lists.length);
      }
      if (Array.isArray(data.movieListLinks)) {
        addedLinks = await db.movieListLinks.bulkAdd(data.movieListLinks).catch(() => 0).then((_) => data.movieListLinks.length);
      }

      // Böcker
      if (Array.isArray(data.books)) {
        addedBooks = await db.books.bulkAdd(data.books).catch(() => 0).then((_) => data.books.length);
      }
      if (Array.isArray(data.bookLists)) {
        addedBookLists = await db.bookLists.bulkAdd(data.bookLists).catch(() => 0).then((_) => data.bookLists.length);
      }
      if (Array.isArray(data.bookListLinks)) {
        addedBookLinks = await db.bookListLinks.bulkAdd(data.bookListLinks).catch(() => 0).then((_) => data.bookListLinks.length);
      }

      // Spel
      if (Array.isArray(data.games)) {
        addedGames = await db.games.bulkAdd(data.games).catch(() => 0).then((_) => data.games.length);
      }
      if (Array.isArray(data.gameLists)) {
        addedGameLists = await db.gameLists.bulkAdd(data.gameLists).catch(() => 0).then((_) => data.gameLists.length);
      }
      if (Array.isArray(data.gameListLinks)) {
        addedGameLinks = await db.gameListLinks.bulkAdd(data.gameListLinks).catch(() => 0).then((_) => data.gameListLinks.length);
      }
    }
  );

  return {
    addedMovies,
    addedLists,
    addedLinks,
    addedBooks,
    addedBookLists,
    addedBookLinks,
    addedGames,
    addedGameLists,
    addedGameLinks,
  };
}

export async function wipeAll() {
  await db.transaction(
    "rw",
    db.movies,
    db.lists,
    db.movieListLinks,
    db.books,
    db.bookLists,
    db.bookListLinks,
    db.games,
    db.gameLists,
    db.gameListLinks,
    async () => {
      await db.movies.clear();
      await db.lists.clear();
      await db.movieListLinks.clear();

      await db.books.clear();
      await db.bookLists.clear();
      await db.bookListLinks.clear();

      await db.games.clear();
      await db.gameLists.clear();
      await db.gameListLinks.clear();
    }
  );
}

// Re-export typer för bekvämlighet
export type { Movie, List, MovieListLink, Book, BookList, BookListLink, Game, GameList, GameListLink };