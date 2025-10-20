// src/db.ts
import Dexie, { Table } from "dexie";
import type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
  // re-exports (types)
  Format, VideoStandard, RegionCode, BookFormat,
} from "./types";
export type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
  // expose primitive enums too (används av formulär/komponenter)
  Format, VideoStandard, RegionCode, BookFormat,
} from "./types";

/* ============================================================
   Dexie setup
   ============================================================ */
export class CinemoriaDB extends Dexie {
  // Film
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  links!: Table<MovieListLink, number>;

  // Böcker
  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookLinks!: Table<BookListLink, number>;

  // Spel
  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameLinks!: Table<GameListLink, number>;

  constructor() {
    super("CinemoriaDB");

    this.version(1).stores({
      // Film
      movies: "++id, title, year, owned, wishlisted, format, createdAt, barcode",
      lists: "++id, name, createdAt",
      links: "++id, movieId, listId, createdAt",

      // Böcker
      books: "++id, title, author, year, owned, wishlisted, format, createdAt, isbn",
      bookLists: "++id, name, createdAt",
      bookLinks: "++id, bookId, listId, createdAt",

      // Spel
      games: "++id, title, year, platform, owned, wishlisted, createdAt",
      gameLists: "++id, name, createdAt",
      gameLinks: "++id, gameId, listId, createdAt",
    });
  }
}

export const db = new CinemoriaDB();

/* ============================================================
   FILM – CRUD light (används av Add/Edit)
   ============================================================ */
export async function addMovie(m: Omit<Movie, "id">) {
  return db.movies.add({ ...m, createdAt: m.createdAt ?? Date.now() });
}
export async function updateMovie(id: number, patch: Partial<Movie>) {
  return db.movies.update(id, { ...patch, /* updatedAt? valfritt */ });
}
export async function deleteMovie(id: number) {
  // rensa ev. links också
  await db.transaction("rw", db.movies, db.links, async () => {
    await db.links.where("movieId").equals(id).delete();
    await db.movies.delete(id);
  });
}

/* ============================================================
   LISTOR (film) – används av MovieHome/Collections/ListDetail
   ============================================================ */
export async function getLists(): Promise<List[]> {
  return db.lists.orderBy("createdAt").reverse().toArray();
}

/** map listId -> antal filmer i listan */
export async function getListCounts(): Promise<Record<number, number>> {
  const allLinks = await db.links.toArray();
  const map: Record<number, number> = {};
  for (const l of allLinks) map[l.listId] = (map[l.listId] ?? 0) + 1;
  return map;
}

export async function createList(name: string) {
  const list: List = { name: name.trim(), createdAt: Date.now() };
  if (!list.name) throw new Error("Listnamn krävs");
  return db.lists.add(list);
}

export async function renameList(id: number, name: string) {
  return db.lists.update(id, { name: name.trim() });
}

export async function deleteList(id: number) {
  await db.transaction("rw", db.lists, db.links, async () => {
    await db.links.where("listId").equals(id).delete();
    await db.lists.delete(id);
  });
}

/** Hämtar en lista (eller undefined om den saknas). */
export async function getListById(id: number) {
  return db.lists.get(id);
}

/** Alla filmer i en lista, sorterade på titel. */
export async function getMoviesInList(listId: number): Promise<Movie[]> {
  const links = await db.links.where("listId").equals(listId).toArray();
  const ids = links.map(l => l.movieId);
  if (ids.length === 0) return [];
  const movies = await db.movies.bulkGet(ids);
  return (movies.filter(Boolean) as Movie[]).sort((a, b) =>
    (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" })
  );
}

/** Skapar kopplingen film↔lista om den inte redan finns. */
export async function linkMovieToList(listId: number, movieId: number) {
  const exists = await db.links.where({ listId, movieId }).first();
  if (!exists) await db.links.add({ listId, movieId, createdAt: Date.now() });
}

/** Alias/kompabilitet med äldre importer */
export const addMovieToList = linkMovieToList;

export async function removeMovieFromList(listId: number, movieId: number) {
  const found = await db.links.where({ listId, movieId }).first();
  if (found?.id != null) await db.links.delete(found.id);
}

/* ============================================================
   BACKUP / IMPORT / WIPE – används av ProfilePage
   ============================================================ */
type Dump = {
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

export async function exportJson(): Promise<string> {
  const [movies, lists, links, books, bookLists, bookLinks, games, gameLists, gameLinks] =
    await Promise.all([
      db.movies.toArray(),
      db.lists.toArray(),
      db.links.toArray(),
      db.books.toArray(),
      db.bookLists.toArray(),
      db.bookLinks.toArray(),
      db.games.toArray(),
      db.gameLists.toArray(),
      db.gameLinks.toArray(),
    ]);

  const payload: Dump = {
    movies, lists, links,
    books, bookLists, bookLinks,
    games, gameLists, gameLinks,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importJson(raw: string) {
  const data = JSON.parse(raw) as Dump;

  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  await db.transaction(
    "rw",
    db.movies, db.lists, db.links,
    db.books, db.bookLists, db.bookLinks,
    db.games, db.gameLists, db.gameLinks,
    async () => {
      if (data.movies?.length) {
        addedMovies = (await db.movies.bulkAdd(data.movies, { allKeys: true })).length ?? 0;
      }
      if (data.lists?.length) {
        addedLists = (await db.lists.bulkAdd(data.lists, { allKeys: true })).length ?? 0;
      }
      if (data.links?.length) {
        addedLinks = (await db.links.bulkAdd(data.links, { allKeys: true })).length ?? 0;
      }

      if (data.books?.length) {
        addedBooks = (await db.books.bulkAdd(data.books, { allKeys: true })).length ?? 0;
      }
      if (data.bookLists?.length) {
        addedBookLists = (await db.bookLists.bulkAdd(data.bookLists, { allKeys: true })).length ?? 0;
      }
      if (data.bookLinks?.length) {
        addedBookLinks = (await db.bookLinks.bulkAdd(data.bookLinks, { allKeys: true })).length ?? 0;
      }

      if (data.games?.length) {
        addedGames = (await db.games.bulkAdd(data.games, { allKeys: true })).length ?? 0;
      }
      if (data.gameLists?.length) {
        addedGameLists = (await db.gameLists.bulkAdd(data.gameLists, { allKeys: true })).length ?? 0;
      }
      if (data.gameLinks?.length) {
        addedGameLinks = (await db.gameLinks.bulkAdd(data.gameLinks, { allKeys: true })).length ?? 0;
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
    db.movies, db.lists, db.links,
    db.books, db.bookLists, db.bookLinks,
    db.games, db.gameLists, db.gameLinks,
    async () => {
      await Promise.all([
        db.movies.clear(),
        db.lists.clear(),
        db.links.clear(),
        db.books.clear(),
        db.bookLists.clear(),
        db.bookLinks.clear(),
        db.games.clear(),
        db.gameLists.clear(),
        db.gameLinks.clear(),
      ]);
    }
  );
}