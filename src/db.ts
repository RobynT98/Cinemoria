// src/db.ts
import Dexie, { Table } from "dexie";
import type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
} from "./types";

// Re-export typer så `import { type Movie } from "@/db"` funkar
export type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
} from "./types";

export class CinemoriaDB extends Dexie {
  // Film
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  links!: Table<MovieListLink, number>;

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
      // Film
      movies: "++id, title, year, owned, wishlisted, digital, format, createdAt, barcode",
      lists: "++id, name, createdAt",
      links: "++id, listId, movieId",

      // Böcker
      books: "++id, title, author, year, owned, wishlisted, digital, format, createdAt, isbn",
      bookLists: "++id, name, createdAt",
      bookListLinks: "++id, listId, bookId",

      // Spel
      games: "++id, title, year, platform, owned, wishlisted, digital, createdAt, barcode",
      gameLists: "++id, name, createdAt",
      gameListLinks: "++id, listId, gameId",
    });
  }
}

export const db = new CinemoriaDB();

/* ============================================================
   FILM – helpers
   ============================================================ */

export async function addMovie(m: Movie) {
  const now = Date.now();
  return db.movies.add({ ...m, createdAt: m.createdAt ?? now, updatedAt: now });
}
export async function updateMovie(id: number, patch: Partial<Movie>) {
  const updatedAt = Date.now();
  await db.movies.update(id, { ...patch, updatedAt });
}
export async function removeMovie(id: number) {
  // ta bort eventuella länkar också
  await db.links.where("movieId").equals(id).delete();
  await db.movies.delete(id);
}

/* ============================================================
   LISTOR (film)
   ============================================================ */

export async function getLists(): Promise<List[]> {
  // senaste först i UI, men CollectionsPage kan sortera om vid behov
  return db.lists.orderBy("createdAt").reverse().toArray();
}

/** map listId -> antal filmer i listan */
export async function getListCounts(): Promise<Record<number, number>> {
  const allLinks = await db.links.toArray();
  const map: Record<number, number> = {};
  for (const l of allLinks) {
    map[l.listId] = (map[l.listId] ?? 0) + 1;
  }
  return map;
}

export async function createList(name: string) {
  const list: List = { name: name.trim(), createdAt: Date.now() };
  if (!list.name) throw new Error("Listnamn krävs");
  const id = await db.lists.add(list);
  return id;
}

export async function renameList(id: number, name: string) {
  await db.lists.update(id, { name: name.trim() });
}

export async function deleteList(id: number) {
  await db.transaction("rw", db.lists, db.links, async () => {
    await db.links.where("listId").equals(id).delete();
    await db.lists.delete(id);
  });
}

export async function addMovieToList(listId: number, movieId: number) {
  const exists = await db.links
    .where({ listId, movieId })
    .first();
  if (!exists) {
    await db.links.add({ listId, movieId, createdAt: Date.now() });
  }
}

export async function removeMovieFromList(listId: number, movieId: number) {
  const found = await db.links.where({ listId, movieId }).first();
  if (found?.id != null) {
    await db.links.delete(found.id);
  }
}

/** Alias som vissa sidor kan importera */
export const addToList = addMovieToList;
export const removeFromList = removeMovieFromList;

/** Hämta alla filmer i en lista (sorterade på titel) */
export async function getListMovies(listId: number): Promise<Movie[]> {
  const links = await db.links.where("listId").equals(listId).toArray();
  const ids = links.map(l => l.movieId);
  if (ids.length === 0) return [];
  const movies = await db.movies.bulkGet(ids);
  return (movies.filter(Boolean) as Movie[]).sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );
}

/* ============================================================
   BACKUP / IMPORT / WIPE
   ============================================================ */

type ExportShape = {
  movies: Movie[];
  lists: List[];
  links: MovieListLink[];
  books: Book[];
  bookLists: BookList[];
  bookListLinks: BookListLink[];
  games: Game[];
  gameLists: GameList[];
  gameListLinks: GameListLink[];
};

export async function exportJson(): Promise<string> {
  const payload: ExportShape = {
    movies: await db.movies.toArray(),
    lists: await db.lists.toArray(),
    links: await db.links.toArray(),
    books: await db.books.toArray(),
    bookLists: await db.bookLists.toArray(),
    bookListLinks: await db.bookListLinks.toArray(),
    games: await db.games.toArray(),
    gameLists: await db.gameLists.toArray(),
    gameListLinks: await db.gameListLinks.toArray(),
  };
  return JSON.stringify(payload, null, 2);
}

export async function importJson(raw: string) {
  const json = JSON.parse(raw) as Partial<ExportShape>;

  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  await db.transaction("rw",
    db.movies, db.lists, db.links,
    db.books, db.bookLists, db.bookListLinks,
    db.games, db.gameLists, db.gameListLinks,
    async () => {
      if (json.movies)       { await db.movies.bulkAdd(json.movies, { allKeys: false }); addedMovies = json.movies.length; }
      if (json.lists)        { await db.lists.bulkAdd(json.lists, { allKeys: false }); addedLists = json.lists.length; }
      if (json.links)        { await db.links.bulkAdd(json.links, { allKeys: false }); addedLinks = json.links.length; }

      if (json.books)        { await db.books.bulkAdd(json.books, { allKeys: false }); addedBooks = json.books.length; }
      if (json.bookLists)    { await db.bookLists.bulkAdd(json.bookLists, { allKeys: false }); addedBookLists = json.bookLists.length; }
      if (json.bookListLinks){ await db.bookListLinks.bulkAdd(json.bookListLinks, { allKeys: false }); addedBookLinks = json.bookListLinks.length; }

      if (json.games)        { await db.games.bulkAdd(json.games, { allKeys: false }); addedGames = json.games.length; }
      if (json.gameLists)    { await db.gameLists.bulkAdd(json.gameLists, { allKeys: false }); addedGameLists = json.gameLists.length; }
      if (json.gameListLinks){ await db.gameListLinks.bulkAdd(json.gameListLinks, { allKeys: false }); addedGameLinks = json.gameListLinks.length; }
    });

  return {
    addedMovies, addedLists, addedLinks,
    addedBooks, addedBookLists, addedBookLinks,
    addedGames, addedGameLists, addedGameLinks,
  };
}

export async function wipeAll() {
  await db.transaction("rw",
    db.movies, db.lists, db.links,
    db.books, db.bookLists, db.bookListLinks,
    db.games, db.gameLists, db.gameListLinks,
    async () => {
      await Promise.all([
        db.movies.clear(), db.lists.clear(), db.links.clear(),
        db.books.clear(), db.bookLists.clear(), db.bookListLinks.clear(),
        db.games.clear(), db.gameLists.clear(), db.gameListLinks.clear(),
      ]);
    });
}