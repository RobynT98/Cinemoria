// src/lib/backup.ts
import { db } from "@/db";
import type {
  // Movie
  Movie, List, MovieListLink,
  // Book
  Book, BookList, BookListLink,
  // Game
  Game, GameList, GameListLink,
  // Album (Music)
  Album, AlbumList, AlbumListLink,
  // Comic (Serier)
  Comic, ComicList, ComicListLink,
} from "@/types";

/* -----------------------------------------------------------
   FULL EXPORT
----------------------------------------------------------- */
export async function exportJson(): Promise<string> {
  const [
    // Movies
    movies, lists, movieLinks,
    // Books
    books, bookLists, bookLinks,
    // Games
    games, gameLists, gameLinks,
    // Albums
    albums, albumLists, albumLinks,
    // Comics
    comics, comicLists, comicLinks,
  ] = await Promise.all([
    // Movies
    db.movies.toArray(),
    db.lists.toArray(),
    db.movieListLinks.toArray(),
    // Books
    db.books.toArray(),
    db.bookLists.toArray(),
    db.bookListLinks.toArray(),
    // Games
    db.games.toArray(),
    db.gameLists.toArray(),
    db.gameListLinks.toArray(),
    // Albums
    db.albums.toArray(),
    db.albumLists.toArray(),
    db.albumListLinks.toArray(),
    // Comics
    db.comics.toArray(),
    db.comicLists.toArray(),
    db.comicListLinks.toArray(),
  ]);

  return JSON.stringify(
    {
      // Movies
      movies,
      lists,
      links: movieLinks,
      // Books
      books,
      bookLists,
      bookLinks,
      // Games
      games,
      gameLists,
      gameLinks,
      // Albums
      albums,
      albumLists,
      albumLinks,
      // Comics
      comics,
      comicLists,
      comicLinks,
    },
    null,
    2
  );
}

/* -----------------------------------------------------------
   PARTIELL EXPORT (filmer + berörda listor/länkar)
   – Behåller befintligt API för bakåtkompabilitet
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
  const allLinks = await db.movieListLinks.toArray();
  const links = allLinks.filter((l) => movieIds.has(l.movieId));

  // Endast listor som förekommer i länkarna
  const listIds = new Set(links.map((l) => l.listId));
  const lists = (await db.lists.toArray()).filter((l) => listIds.has(l.id!));

  return JSON.stringify(
    {
      movies,
      lists,
      links,
      // Övriga domäner lämnas tomma i subset
      books: [],
      bookLists: [],
      bookLinks: [],
      games: [],
      gameLists: [],
      gameLinks: [],
      albums: [],
      albumLists: [],
      albumLinks: [],
      comics: [],
      comicLists: [],
      comicLinks: [],
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
    // Movies
    movies?: Movie[];
    lists?: List[];
    links?: MovieListLink[];

    // Books
    books?: Book[];
    bookLists?: BookList[];
    bookLinks?: BookListLink[];

    // Games
    games?: Game[];
    gameLists?: GameList[];
    gameLinks?: GameListLink[];

    // Albums
    albums?: Album[];
    albumLists?: AlbumList[];
    albumLinks?: AlbumListLink[];

    // Comics
    comics?: Comic[];
    comicLists?: ComicList[];
    comicLinks?: ComicListLink[];
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

  const albums = Array.isArray(data.albums) ? data.albums : [];
  const albumLists = Array.isArray(data.albumLists) ? data.albumLists : [];
  const albumLinks = Array.isArray(data.albumLinks) ? data.albumLinks : [];

  const comics = Array.isArray(data.comics) ? data.comics : [];
  const comicLists = Array.isArray(data.comicLists) ? data.comicLists : [];
  const comicLinks = Array.isArray(data.comicLinks) ? data.comicLinks : [];

  // Counters
  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;
  let addedAlbums = 0, addedAlbumLists = 0, addedAlbumLinks = 0;
  let addedComics = 0, addedComicLists = 0, addedComicLinks = 0;

  // Id-mappar (gammalt → nytt)
  const movieIdMap = new Map<number, number>();
  const listIdMap = new Map<number, number>();

  const bookIdMap = new Map<number, number>();
  const bookListIdMap = new Map<number, number>();

  const gameIdMap = new Map<number, number>();
  const gameListIdMap = new Map<number, number>();

  const albumIdMap = new Map<number, number>();
  const albumListIdMap = new Map<number, number>();

  const comicIdMap = new Map<number, number>();
  const comicListIdMap = new Map<number, number>();

  await db.transaction(
    "rw",
    [
      // Movies
      db.movies, db.lists, db.movieListLinks,
      // Books
      db.books, db.bookLists, db.bookListLinks,
      // Games
      db.games, db.gameLists, db.gameListLinks,
      // Albums
      db.albums, db.albumLists, db.albumListLinks,
      // Comics
      db.comics, db.comicLists, db.comicListLinks,
    ],
    async () => {
      /* ---- FILMER ---- */
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
        const exists = await db.movieListLinks.where({ movieId, listId }).first();
        if (!exists) {
          await db.movieListLinks.add({ movieId, listId, createdAt: Date.now() } as MovieListLink);
          addedLinks++;
        }
      }

      /* ---- BÖCKER ---- */
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
        const exists = await db.bookListLinks.where({ bookId, listId }).first();
        if (!exists) {
          await db.bookListLinks.add({ bookId, listId, createdAt: Date.now() } as BookListLink);
          addedBookLinks++;
        }
      }

      /* ---- SPEL ---- */
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
        const exists = await db.gameListLinks.where({ gameId, listId }).first();
        if (!exists) {
          await db.gameListLinks.add({ gameId, listId, createdAt: Date.now() } as GameListLink);
          addedGameLinks++;
        }
      }

      /* ---- ALBUM ---- */
      for (const a of albums) {
        const { id: _old, updatedAt, createdAt, ...rest } = a as any;
        const now = Date.now();
        const id = await db.albums.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as Album);
        addedAlbums++;
        if (typeof (a as any).id === "number") albumIdMap.set((a as any).id, id);
      }

      for (const al of albumLists) {
        const { id: _old, updatedAt, createdAt, ...rest } = al as any;
        const now = Date.now();
        const id = await db.albumLists.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as AlbumList);
        addedAlbumLists++;
        if (typeof (al as any).id === "number") albumListIdMap.set((al as any).id, id);
      }

      for (const ln of albumLinks) {
        const albumId = albumIdMap.get(ln.albumId) ?? ln.albumId;
        const listId  = albumListIdMap.get(ln.listId) ?? ln.listId;
        if (typeof albumId !== "number" || typeof listId !== "number") continue;
        const exists = await db.albumListLinks.where({ albumId, listId }).first();
        if (!exists) {
          await db.albumListLinks.add({ albumId, listId, createdAt: Date.now() } as AlbumListLink);
          addedAlbumLinks++;
        }
      }

      /* ---- COMICS ---- */
      for (const c of comics) {
        const { id: _old, updatedAt, createdAt, ...rest } = c as any;
        const now = Date.now();
        const id = await db.comics.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as Comic);
        addedComics++;
        if (typeof (c as any).id === "number") comicIdMap.set((c as any).id, id);
      }

      for (const cl of comicLists) {
        const { id: _old, updatedAt, createdAt, ...rest } = cl as any;
        const now = Date.now();
        const id = await db.comicLists.add({
          ...rest,
          createdAt: createdAt || now,
          updatedAt: updatedAt || now,
        } as ComicList);
        addedComicLists++;
        if (typeof (cl as any).id === "number") comicListIdMap.set((cl as any).id, id);
      }

      for (const ln of comicLinks) {
        const comicId = comicIdMap.get(ln.comicId) ?? ln.comicId;
        const listId  = comicListIdMap.get(ln.listId) ?? ln.listId;
        if (typeof comicId !== "number" || typeof listId !== "number") continue;
        const exists = await db.comicListLinks.where({ comicId, listId }).first();
        if (!exists) {
          await db.comicListLinks.add({ comicId, listId, createdAt: Date.now() } as ComicListLink);
          addedComicLinks++;
        }
      }
    }
  );

  return {
    // Movies
    addedMovies, addedLists, addedLinks,
    // Books
    addedBooks, addedBookLists, addedBookLinks,
    // Games
    addedGames, addedGameLists, addedGameLinks,
    // Albums
    addedAlbums, addedAlbumLists, addedAlbumLinks,
    // Comics
    addedComics, addedComicLists, addedComicLinks,
  };
}

/* -----------------------------------------------------------
   WIPE ALL
----------------------------------------------------------- */
export async function wipeAll() {
  await db.transaction(
    "rw",
    [
      // Movies
      db.movies, db.lists, db.movieListLinks,
      // Books
      db.books, db.bookLists, db.bookListLinks,
      // Games
      db.games, db.gameLists, db.gameListLinks,
      // Albums
      db.albums, db.albumLists, db.albumListLinks,
      // Comics
      db.comics, db.comicLists, db.comicListLinks,
    ],
    async () => {
      // Movies
      await db.movieListLinks.clear();
      await db.lists.clear();
      await db.movies.clear();

      // Books
      await db.bookListLinks.clear();
      await db.bookLists.clear();
      await db.books.clear();

      // Games
      await db.gameListLinks.clear();
      await db.gameLists.clear();
      await db.games.clear();

      // Albums
      await db.albumListLinks.clear();
      await db.albumLists.clear();
      await db.albums.clear();

      // Comics
      await db.comicListLinks.clear();
      await db.comicLists.clear();
      await db.comics.clear();
    }
  );
}