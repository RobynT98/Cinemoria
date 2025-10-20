// src/lib/backup.ts
import { db } from "@/db";
import type {
  Movie, List, MovieListLink,
  Book, BookList, BookListLink,
  Game, GameList, GameListLink,
} from "@/types";

/* -----------------------------------------------------------
   FULL EXPORT
----------------------------------------------------------- */
export async function exportJson(): Promise<string> {
  const [
    movies, lists, links,
    books, bookLists, bookLinks,
    games, gameLists, gameLinks,
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

/* -----------------------------------------------------------
   PARTIELL EXPORT (filmer + berörda listor/länkar)
----------------------------------------------------------- */
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
  const movieIds = new Set(movies.map((m) => m.id!));
  const allLinks = await db.movieList.toArray();
  const links = allLinks.filter((l) => movieIds.has(l.movieId));

  // Endast listor som förekommer i länkarna
  const listIds = new Set(links.map((l) => l.listId));
  const lists = (await db.lists.toArray()).filter((l) => listIds.has(l.id!));

  return JSON.stringify(
    {
      movies,
      lists,
      links,
      books: [],
      bookLists: [],
      bookLinks: [],
      games: [],
      gameLists: [],
      gameLinks: [],
    },
    null,
    2
  );
}

/* -----------------------------------------------------------
   IMPORT FRÅN JSON
----------------------------------------------------------- */
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

  // Säkerställ arrayer
  const movies = Array.isArray(data.movies) ? data.movies : [];
  const lists = Array.isArray(data.lists) ? data.lists : [];
  const links = Array.isArray(data.links) ? data.links : [];

  const books = Array.isArray(data.books) ? data.books : [];
  const bookLists = Array.isArray(data.bookLists) ? data.bookLists : [];
  const bookLinks = Array.isArray(data.bookLinks) ? data.bookLinks : [];

  const games = Array.isArray(data.games) ? data.games : [];
  const gameLists = Array.isArray(data.gameLists) ? data.gameLists : [];
  const gameLinks = Array.isArray(data.gameLinks) ? data.gameLinks : [];

  // Counters
  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  // Id-mappar
  const movieIdMap = new Map<number, number>();
  const listIdMap = new Map<number, number>();
  const bookIdMap = new Map<number, number>();
  const bookListIdMap = new Map<number, number>();
  const gameIdMap = new Map<number, number>();
  const gameListIdMap = new Map<number, number>();

  await db.transaction(
    "rw",
    [
      db.movies, db.lists, db.movieList,
      db.books, db.bookLists, db.bookList,
      db.games, db.gameLists, db.gameList,
    ],
    async () => {
      // ---- FILMER ----
      for (const m of movies) {
        const { id: _old, updatedAt, createdAt, ...rest } = m as any;
        const now = Date.now();
        const id = await db.movies.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as Movie);
        addedMovies++;
        if (typeof (m as any).id === "number") movieIdMap.set((m as any).id, id);
      }
      for (const l of lists) {
        const { id: _old, updatedAt, createdAt, ...rest } = l as any;
        const now = Date.now();
        const id = await db.lists.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as List);
        addedLists++;
        if (typeof (l as any).id === "number") listIdMap.set((l as any).id, id);
      }
      for (const ln of links) {
        const movieId = movieIdMap.get(ln.movieId) ?? ln.movieId;
        const listId  = listIdMap.get(ln.listId) ?? ln.listId;
        if (typeof movieId !== "number" || typeof listId !== "number") continue;
        const exists = await db.movieList.where({ movieId, listId }).first();
        if (!exists) { await db.movieList.add({ movieId, listId, createdAt: Date.now() } as any); addedLinks++; }
      }

      // ---- BÖCKER ----
      for (const b of books) {
        const { id: _old, updatedAt, createdAt, ...rest } = b as any;
        const now = Date.now();
        const id = await db.books.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as Book);
        addedBooks++;
        if (typeof (b as any).id === "number") bookIdMap.set((b as any).id, id);
      }
      for (const bl of bookLists) {
        const { id: _old, updatedAt, createdAt, ...rest } = bl as any;
        const now = Date.now();
        const id = await db.bookLists.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as BookList);
        addedBookLists++;
        if (typeof (bl as any).id === "number") bookListIdMap.set((bl as any).id, id);
      }
      for (const ln of bookLinks) {
        const bookId = bookIdMap.get(ln.bookId) ?? ln.bookId;
        const listId = bookListIdMap.get(ln.listId) ?? ln.listId;
        if (typeof bookId !== "number" || typeof listId !== "number") continue;
        const exists = await db.bookList.where({ bookId, listId }).first();
        if (!exists) { await db.bookList.add({ bookId, listId, createdAt: Date.now() } as any); addedBookLinks++; }
      }

      // ---- SPEL ----
      for (const g of games) {
        const { id: _old, updatedAt, createdAt, ...rest } = g as any;
        const now = Date.now();
        const id = await db.games.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as Game);
        addedGames++;
        if (typeof (g as any).id === "number") gameIdMap.set((g as any).id, id);
      }
      for (const gl of gameLists) {
        const { id: _old, updatedAt, createdAt, ...rest } = gl as any;
        const now = Date.now();
        const id = await db.gameLists.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as GameList);
        addedGameLists++;
        if (typeof (gl as any).id === "number") gameListIdMap.set((gl as any).id, id);
      }
      for (const ln of gameLinks) {
        const gameId = gameIdMap.get(ln.gameId) ?? ln.gameId;
        const listId = gameListIdMap.get(ln.listId) ?? ln.listId;
        if (typeof gameId !== "number" || typeof listId !== "number") continue;
        const exists = await db.gameList.where({ gameId, listId }).first();
        if (!exists) { await db.gameList.add({ gameId, listId, createdAt: Date.now() } as any); addedGameLinks++; }
      }
    }
  );

  return {
    addedMovies, addedLists, addedLinks,
    addedBooks, addedBookLists, addedBookLinks,
    addedGames, addedGameLists, addedGameLinks,
  };
}

/* -----------------------------------------------------------
   WIPE ALL
----------------------------------------------------------- */
export async function wipeAll() {
  await db.transaction(
    "rw",
    [
      db.movies, db.lists, db.movieList,
      db.books, db.bookLists, db.bookList,
      db.games, db.gameLists, db.gameList,
    ],
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