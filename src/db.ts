// src/db.ts
import Dexie, { Table } from "dexie";

/* ──────────────────────────────────────────────────────────
   Typer – importera från central "@/types" och återexportera
   ────────────────────────────────────────────────────────── */
import type {
  // gemensamt
  List,
  // film
  Movie, MovieListLink, MovieFormat,
  // böcker
  Book, BookList, BookListLink, BookFormat,
  // spel
  Game, GameList, GameListLink,
  // musik
  Album, AlbumList, AlbumListLink,
  // serier
  Comic, ComicList, ComicListLink,
} from "@/types";

export type {
  // gemensamt
  List,
  // film
  Movie, MovieListLink, MovieFormat,
  // böcker
  Book, BookList, BookListLink, BookFormat,
  // spel
  Game, GameList, GameListLink,
  // musik
  Album, AlbumList, AlbumListLink,
  // serier
  Comic, ComicList, ComicListLink,
} from "@/types";

/* ──────────────────────────────────────────────────────────
   Dexie DB
   ────────────────────────────────────────────────────────── */
export class CinemoriaDB extends Dexie {
  // Filmer
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieListLink, number>;

  // Böcker
  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookList!: Table<BookListLink, number>;

  // Spel
  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameList!: Table<GameListLink, number>;

  // Musik (Album)
  albums!: Table<Album, number>;
  albumLists!: Table<AlbumList, number>;
  albumList!: Table<AlbumListLink, number>;

  // Serier (Comics)
  comics!: Table<Comic, number>;
  comicLists!: Table<ComicList, number>;
  comicList!: Table<ComicListLink, number>;

  constructor() {
    super("CinemoriaDB");

    this.version(1).stores({
      // Film
      movies: "++id,title,year,createdAt,updatedAt",
      lists: "++id,name,createdAt,updatedAt",
      movieList: "++id,movieId,listId,createdAt",

      // Böcker
      books: "++id,title,author,year,createdAt,updatedAt",
      bookLists: "++id,name,createdAt,updatedAt",
      bookList: "++id,bookId,listId,createdAt",

      // Spel
      games: "++id,title,platform,year,createdAt,updatedAt",
      gameLists: "++id,name,createdAt,updatedAt",
      gameList: "++id,gameId,listId,createdAt",

      // Musik
      albums: "++id,title,artist,year,createdAt,updatedAt",
      albumLists: "++id,name,createdAt,updatedAt",
      albumList: "++id,albumId,listId,createdAt",

      // Serier
      comics: "++id,title,seriesTitle,year,createdAt,updatedAt",
      comicLists: "++id,name,createdAt,updatedAt",
      comicList: "++id,comicId,listId,createdAt",
    });
  }
}

export const db = new CinemoriaDB();

/* ──────────────────────────────────────────────────────────
   Helpers – skapa poster (används i AddPage etc.)
   ────────────────────────────────────────────────────────── */
export async function addMovie(data: Partial<Movie> & { title: string }) {
  const now = Date.now();
  return db.movies.add({
    genres: [],
    tags: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as Movie);
}

export async function addBook(data: Partial<Book> & { title: string }) {
  const now = Date.now();
  return db.books.add({
    genres: [],
    tags: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as Book);
}

export async function addGame(data: Partial<Game> & { title: string }) {
  const now = Date.now();
  return db.games.add({
    genres: [],
    tags: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as Game);
}

export async function addAlbum(data: Partial<Album> & { title: string }) {
  const now = Date.now();
  return db.albums.add({
    genres: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as Album);
}

export async function addComic(data: Partial<Comic> & { title: string }) {
  const now = Date.now();
  return db.comics.add({
    genres: [],
    owned: false,
    digital: false,
    wishlisted: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as Comic);
}

/* ──────────────────────────────────────────────────────────
   Helpers – listlänkar (CRUD) för alla sektioner
   ────────────────────────────────────────────────────────── */
// Film
export const getMoviesInList = async (listId: number) => {
  const links = await db.movieList.where("listId").equals(listId).toArray();
  const ids = new Set(links.map(l => Number(l.movieId)));
  const all = await db.movies.toArray();
  return all.filter(m => typeof m.id === "number" && ids.has(Number(m.id)));
};
export const linkMovieToList = async (listId: number, movieId: number) => {
  const exists = await db.movieList.where({ listId, movieId }).first();
  if (!exists) await db.movieList.add({ listId, movieId, createdAt: Date.now() } as MovieListLink);
};
export const unlinkMovieFromList = async (listId: number, movieId: number) => {
  const link = await db.movieList.where({ listId, movieId }).first();
  if ((link as any)?.id) await db.movieList.delete((link as any).id);
};
export async function getLists() {
  // Alla filmsamlingar
  return db.lists.toArray();
}
export async function getListCounts() {
  // Antal filmer per lista (från länktabellen movieList)
  const links = await db.movieList.toArray();
  const counts: Record<number, number> = {};
  for (const ln of links) {
    const id = Number(ln.listId);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
};

// Böcker
export const getBooksInBookList = async (listId: number) => {
  const links = await db.bookList.where("listId").equals(listId).toArray();
  const ids = new Set(links.map(l => Number(l.bookId)));
  const all = await db.books.toArray();
  return all.filter(b => typeof b.id === "number" && ids.has(Number(b.id)));
};
export const linkBookToList = async (listId: number, bookId: number) => {
  const exists = await db.bookList.where({ listId, bookId }).first();
  if (!exists) await db.bookList.add({ listId, bookId, createdAt: Date.now() } as BookListLink);
};
export const unlinkBookFromList = async (listId: number, bookId: number) => {
  const link = await db.bookList.where({ listId, bookId }).first();
  if ((link as any)?.id) await db.bookList.delete((link as any).id);
};

// Spel
export const getGamesInGameList = async (listId: number) => {
  const links = await db.gameList.where("listId").equals(listId).toArray();
  const ids = new Set(links.map(l => Number(l.gameId)));
  const all = await db.games.toArray();
  return all.filter(g => typeof g.id === "number" && ids.has(Number(g.id)));
};
export const linkGameToList = async (listId: number, gameId: number) => {
  const exists = await db.gameList.where({ listId, gameId }).first();
  if (!exists) await db.gameList.add({ listId, gameId, createdAt: Date.now() } as GameListLink);
};
export const unlinkGameFromList = async (listId: number, gameId: number) => {
  const link = await db.gameList.where({ listId, gameId }).first();
  if ((link as any)?.id) await db.gameList.delete((link as any).id);
};

// Album (musik)
export const getAlbumsInAlbumList = async (listId: number) => {
  const links = await db.albumList.where("listId").equals(listId).toArray();
  const ids = new Set(links.map(l => Number(l.albumId)));
  const all = await db.albums.toArray();
  return all.filter(a => typeof a.id === "number" && ids.has(Number(a.id)));
};
export const linkAlbumToList = async (listId: number, albumId: number) => {
  const exists = await db.albumList.where({ listId, albumId }).first();
  if (!exists) await db.albumList.add({ listId, albumId, createdAt: Date.now() } as AlbumListLink);
};
export const unlinkAlbumFromList = async (listId: number, albumId: number) => {
  const link = await db.albumList.where({ listId, albumId }).first();
  if ((link as any)?.id) await db.albumList.delete((link as any).id);
};

// Serier (comics)
export const getComicsInComicList = async (listId: number) => {
  const links = await db.comicList.where("listId").equals(listId).toArray();
  const ids = new Set(links.map(l => Number(l.comicId)));
  const all = await db.comics.toArray();
  return all.filter(c => typeof c.id === "number" && ids.has(Number(c.id)));
};
export const linkComicToList = async (listId: number, comicId: number) => {
  const exists = await db.comicList.where({ listId, comicId }).first();
  if (!exists) await db.comicList.add({ listId, comicId, createdAt: Date.now() } as ComicListLink);
};
export const unlinkComicFromList = async (listId: number, comicId: number) => {
  const link = await db.comicList.where({ listId, comicId }).first();
  if ((link as any)?.id) await db.comicList.delete((link as any).id);
};

/* ──────────────────────────────────────────────────────────
   Små helpers för att byta namn/ta bort listor (återanvänds)
   ────────────────────────────────────────────────────────── */
// Film
export const renameList = (id: number, name: string) =>
  db.lists.update(id, { name, updatedAt: Date.now() });
export const deleteList = async (id: number) => {
  const links = await db.movieList.where("listId").equals(id).toArray();
  await db.transaction("rw", [db.movieList, db.lists], async () => {
    for (const ln of links) if ((ln as any).id) await db.movieList.delete((ln as any).id);
    await db.lists.delete(id);
  });
};

// Böcker
export const renameBookList = (id: number, name: string) =>
  db.bookLists.update(id, { name, updatedAt: Date.now() });
export const deleteBookList = async (id: number) => {
  const links = await db.bookList.where("listId").equals(id).toArray();
  await db.transaction("rw", [db.bookList, db.bookLists], async () => {
    for (const ln of links) if ((ln as any).id) await db.bookList.delete((ln as any).id);
    await db.bookLists.delete(id);
  });
};

// Spel
export const renameGameList = (id: number, name: string) =>
  db.gameLists.update(id, { name, updatedAt: Date.now() });
export const deleteGameList = async (id: number) => {
  const links = await db.gameList.where("listId").equals(id).toArray();
  await db.transaction("rw", [db.gameList, db.gameLists], async () => {
    for (const ln of links) if ((ln as any).id) await db.gameList.delete((ln as any).id);
    await db.gameLists.delete(id);
  });
};

// Musik
export const renameAlbumList = (id: number, name: string) =>
  db.albumLists.update(id, { name, updatedAt: Date.now() });
export const deleteAlbumList = async (id: number) => {
  const links = await db.albumList.where("listId").equals(id).toArray();
  await db.transaction("rw", [db.albumList, db.albumLists], async () => {
    for (const ln of links) if ((ln as any).id) await db.albumList.delete((ln as any).id);
    await db.albumLists.delete(id);
  });
};

// Serier
export const renameComicList = (id: number, name: string) =>
  db.comicLists.update(id, { name, updatedAt: Date.now() });
export const deleteComicList = async (id: number) => {
  const links = await db.comicList.where("listId").equals(id).toArray();
  await db.transaction("rw", [db.comicList, db.comicLists], async () => {
    for (const ln of links) if ((ln as any).id) await db.comicList.delete((ln as any).id);
    await db.comicLists.delete(id);
  });
};