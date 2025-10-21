// src/db.ts
import Dexie, { Table } from "dexie";

// Re-exportera alla typer så sidor kan göra: `import { type Movie } from "@/db"`
export type {
  // Film
  Movie,
  List,
  MovieLink,
  // Böcker
  Book,
  BookList,
  BookLink,
  // Spel
  Game,
  GameList,
  GameLink,
  // Musik
  Album,
  AlbumList,
  AlbumLink,
  // Serietidningar
  Comic,
  ComicList,
  ComicLink,
} from "./types";

// Importera typerna lokalt för DB-klassens generics
import type {
  Movie,
  List,
  MovieLink,
  Book,
  BookList,
  BookLink,
  Game,
  GameList,
  GameLink,
  Album,
  AlbumList,
  AlbumLink,
  Comic,
  ComicList,
  ComicLink,
} from "./types";

/**
 * Dexie-schema
 *
 * Notera namngivningen:
 * - FILM: movies, lists (LIST-TABELL), movieList (LINK-TABELL)
 * - BOK:  books, bookLists, bookList
 * - SPEL: games, gameLists, gameList
 * - MUSIK: albums, albumLists, albumList
 * - COMICS: comics, comicLists, comicList
 *
 * Detta matchar hur dina sidor redan anropar db.*
 */
export class CinemoriaDB extends Dexie {
  // FILM
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieLink, number>;

  // BOK
  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookList!: Table<BookLink, number>;

  // SPEL
  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameList!: Table<GameLink, number>;

  // MUSIK
  albums!: Table<Album, number>;
  albumLists!: Table<AlbumList, number>;
  albumList!: Table<AlbumLink, number>;

  // COMICS
  comics!: Table<Comic, number>;
  comicLists!: Table<ComicList, number>;
  comicList!: Table<ComicLink, number>;

  constructor() {
    super("CinemoriaDB");

    // BUMPA versionen om du redan har äldre data. Dexie kräver full schema per version.
    // Här lägger vi ett "nuvarande" schema som inkluderar allt.
    this.version(6).stores({
      // FILM
      movies:
        "++id, title, year, owned, digital, wishlisted, format, barcode, createdAt",
      lists: "++id, name, createdAt",
      movieList: "++id, listId, movieId, createdAt",

      // BOK
      books:
        "++id, title, author, year, owned, digital, wishlisted, format, isbn, language, createdAt",
      bookLists: "++id, name, createdAt",
      bookList: "++id, listId, bookId, createdAt",

      // SPEL
      games:
        "++id, title, platform, year, owned, digital, wishlisted, createdAt",
      gameLists: "++id, name, createdAt",
      gameList: "++id, listId, gameId, createdAt",

      // MUSIK
      albums:
        "++id, title, artist, year, owned, digital, wishlisted, format, barcode, label, catalogNo, createdAt",
      albumLists: "++id, name, createdAt",
      albumList: "++id, listId, albumId, createdAt",

      // COMICS
      comics:
        "++id, title, series, year, owned, digital, wishlisted, format, publisher, isbn, issn, barcode, createdAt",
      comicLists: "++id, name, createdAt",
      comicList: "++id, listId, comicId, createdAt",
    });

    // En enkel migrations-hook om du vill rätta namnbyten framåt.
    // (Lämnas tom – vi har bara lagt till nya stores.)
    this.version(7).stores({}).upgrade(() => {
      // framtida migreringar kan hamna här
    });
  }
}

export const db = new CinemoriaDB();

/* ---------------------------------------------------
 * FILM – hjälpfunktioner (matchar dina sidor)
 * --------------------------------------------------- */

export const getLists = () => db.lists.toArray();
export const getListById = (id: number) => db.lists.get(id);
export const createList = (name: string) =>
  db.lists.add({ name, createdAt: Date.now() });
export const renameList = (id: number, name: string) =>
  db.lists.update(id, { name, updatedAt: Date.now() });
export const deleteList = async (id: number) => {
  await db.transaction("rw", [db.movieList, db.lists], async () => {
    await db.movieList.where("listId").equals(id).delete();
    await db.lists.delete(id);
  });
};
export const linkMovieToList = (listId: number, movieId: number) =>
  db.movieList.add({ listId, movieId, createdAt: Date.now() } as MovieLink);
export const unlinkMovieFromList = (listId: number, movieId: number) =>
  db.movieList.where({ listId, movieId }).delete();
export const getMoviesInList = async (listId: number) => {
  const links = await db.movieList.where("listId").equals(listId).toArray();
  const ids = links.map((l) => l.movieId);
  return ids.length ? db.movies.where("id").anyOf(ids).toArray() : [];
};
export const getListCounts = async () => {
  // Returnera som Record<string, number> (dina sidor förväntar det)
  const map: Record<string, number> = {};
  await db.movieList.toCollection().each((l) => {
    const k = String(l.listId);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};

/* ---------------------------------------------------
 * BÖCKER
 * --------------------------------------------------- */

export const getBookLists = () => db.bookLists.toArray();
export const getBookListById = (id: number) => db.bookLists.get(id);
export const createBookList = (name: string) =>
  db.bookLists.add({ name, createdAt: Date.now() });
export const renameBookList = (id: number, name: string) =>
  db.bookLists.update(id, { name, updatedAt: Date.now() });
export const deleteBookList = async (id: number) => {
  await db.transaction("rw", [db.bookList, db.bookLists], async () => {
    await db.bookList.where("listId").equals(id).delete();
    await db.bookLists.delete(id);
  });
};
export const linkBookToList = (listId: number, bookId: number) =>
  db.bookList.add({ listId, bookId, createdAt: Date.now() } as BookLink);
export const unlinkBookFromList = (listId: number, bookId: number) =>
  db.bookList.where({ listId, bookId }).delete();
export const getBooksInBookList = async (listId: number) => {
  const links = await db.bookList.where("listId").equals(listId).toArray();
  const ids = links.map((l) => l.bookId);
  return ids.length ? db.books.where("id").anyOf(ids).toArray() : [];
};
export const getBookListCounts = async () => {
  const map: Record<string, number> = {};
  await db.bookList.toCollection().each((l) => {
    const k = String(l.listId);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};

/* ---------------------------------------------------
 * SPEL
 * --------------------------------------------------- */

export const getGameLists = () => db.gameLists.toArray();
export const getGameListById = (id: number) => db.gameLists.get(id);
export const createGameList = (name: string) =>
  db.gameLists.add({ name, createdAt: Date.now() });
export const renameGameList = (id: number, name: string) =>
  db.gameLists.update(id, { name, updatedAt: Date.now() });
export const deleteGameList = async (id: number) => {
  await db.transaction("rw", [db.gameList, db.gameLists], async () => {
    await db.gameList.where("listId").equals(id).delete();
    await db.gameLists.delete(id);
  });
};
export const linkGameToList = (listId: number, gameId: number) =>
  db.gameList.add({ listId, gameId, createdAt: Date.now() } as GameLink);
export const unlinkGameFromList = (listId: number, gameId: number) =>
  db.gameList.where({ listId, gameId }).delete();
export const getGamesInGameList = async (listId: number) => {
  const links = await db.gameList.where("listId").equals(listId).toArray();
  const ids = links.map((l) => l.gameId);
  return ids.length ? db.games.where("id").anyOf(ids).toArray() : [];
};
export const getGameListCounts = async () => {
  const map: Record<string, number> = {};
  await db.gameList.toCollection().each((l) => {
    const k = String(l.listId);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};

/* ---------------------------------------------------
 * MUSIK (ALBUMS)
 * --------------------------------------------------- */

export const getAlbumLists = () => db.albumLists.toArray();
export const getAlbumListById = (id: number) => db.albumLists.get(id);
export const createAlbumList = (name: string) =>
  db.albumLists.add({ name, createdAt: Date.now() });
export const renameAlbumList = (id: number, name: string) =>
  db.albumLists.update(id, { name, updatedAt: Date.now() });
export const deleteAlbumList = async (id: number) => {
  await db.transaction("rw", [db.albumList, db.albumLists], async () => {
    await db.albumList.where("listId").equals(id).delete();
    await db.albumLists.delete(id);
  });
};
export const linkAlbumToList = (listId: number, albumId: number) =>
  db.albumList.add({ listId, albumId, createdAt: Date.now() } as AlbumLink);
export const unlinkAlbumFromList = (listId: number, albumId: number) =>
  db.albumList.where({ listId, albumId }).delete();
export const getAlbumsInAlbumList = async (listId: number) => {
  const links = await db.albumList.where("listId").equals(listId).toArray();
  const ids = links.map((l) => l.albumId);
  return ids.length ? db.albums.where("id").anyOf(ids).toArray() : [];
};
export const getAlbumListCounts = async () => {
  const map: Record<string, number> = {};
  await db.albumList.toCollection().each((l) => {
    const k = String(l.listId);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};

/* ---------------------------------------------------
 * COMICS (SERIETIDNINGAR)
 * --------------------------------------------------- */

export const getComicLists = () => db.comicLists.toArray();
export const getComicListById = (id: number) => db.comicLists.get(id);
export const createComicList = (name: string) =>
  db.comicLists.add({ name, createdAt: Date.now() });
export const renameComicList = (id: number, name: string) =>
  db.comicLists.update(id, { name, updatedAt: Date.now() });
export const deleteComicList = async (id: number) => {
  await db.transaction("rw", [db.comicList, db.comicLists], async () => {
    await db.comicList.where("listId").equals(id).delete();
    await db.comicLists.delete(id);
  });
};
export const linkComicToList = (listId: number, comicId: number) =>
  db.comicList.add({ listId, comicId, createdAt: Date.now() } as ComicLink);
export const unlinkComicFromList = (listId: number, comicId: number) =>
  db.comicList.where({ listId, comicId }).delete();
export const getComicsInComicList = async (listId: number) => {
  const links = await db.comicList.where("listId").equals(listId).toArray();
  const ids = links.map((l) => l.comicId);
  return ids.length ? db.comics.where("id").anyOf(ids).toArray() : [];
};
export const getComicListCounts = async () => {
  const map: Record<string, number> = {};
  await db.comicList.toCollection().each((l) => {
    const k = String(l.listId);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};