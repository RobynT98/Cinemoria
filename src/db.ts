// src/db.ts
import Dexie, { type Table } from "dexie";
import type {
  Movie,
  Book,
  Game,
  List,
  MovieListLink,
} from "@/types";

// Re-export types so pages can import from "@/db"
export type {
  Movie,
  Book,
  Game,
  List,
  MovieListLink,
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

  lists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  constructor() {
    super("cinemoria");

    this.version(1).stores({
      movies: "++id, title, createdAt, owned, digital, wishlisted, barcode",
      books:  "++id, title, createdAt, owned, digital, wishlisted, isbn",
      games:  "++id, title, createdAt, owned, digital, wishlisted, barcode",

      lists:           "++id, name, createdAt",
      movieListLinks:  "++id, listId, movieId, createdAt",
    });

    this.movies = this.table("movies");
    this.books = this.table("books");
    this.games = this.table("games");
    this.lists = this.table("lists");
    this.movieListLinks = this.table("movieListLinks");
  }
}

export const db = new AppDB();

/* =========================
   MOVIES – CRUD
========================= */
export async function addMovie(data: Movie): Promise<number> {
  const now = Date.now();
  return db.movies.add({
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
  });
}

export async function getMovie(id: number): Promise<Movie | undefined> {
  return db.movies.get(id);
}

export async function updateMovie(id: number, patch: Partial<Movie>): Promise<void> {
  await db.movies.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteMovie(id: number): Promise<void> {
  await db.transaction("rw", db.movieListLinks, db.movies, async () => {
    await db.movieListLinks.where({ movieId: id }).delete();
    await db.movies.delete(id);
  });
}

/* =========================
   BOOKS – small CRUD (for parity)
========================= */
export async function addBook(data: Book): Promise<number> {
  const now = Date.now();
  return db.books.add({
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
  });
}

export async function getBook(id: number): Promise<Book | undefined> {
  return db.books.get(id);
}

export async function updateBook(id: number, patch: Partial<Book>): Promise<void> {
  await db.books.update(id, { ...patch, updatedAt: Date.now() });
}

/* =========================
   GAMES – small CRUD
========================= */
export async function addGame(data: Game): Promise<number> {
  const now = Date.now();
  return db.games.add({
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
  });
}

export async function getGame(id: number): Promise<Game | undefined> {
  return db.games.get(id);
}

export async function updateGame(id: number, patch: Partial<Game>): Promise<void> {
  await db.games.update(id, { ...patch, updatedAt: Date.now() });
}

/* =========================
   LISTS (Movies)
========================= */
export async function getLists(): Promise<List[]> {
  return db.lists.orderBy("createdAt").reverse().toArray();
}

export async function createList(name: string): Promise<number> {
  const now = Date.now();
  return db.lists.add({ name, createdAt: now, updatedAt: now });
}

export async function renameList(id: number, name: string): Promise<void> {
  await db.lists.update(id, { name, updatedAt: Date.now() });
}

export async function deleteList(id: number): Promise<void> {
  await db.transaction("rw", db.movieListLinks, db.lists, async () => {
    await db.movieListLinks.where({ listId: id }).delete();
    await db.lists.delete(id);
  });
}

export async function getListById(id: number): Promise<List | undefined> {
  return db.lists.get(id);
}

export async function linkMovieToList(movieId: number, listId: number): Promise<void> {
  const exists = await db.movieListLinks.where({ movieId, listId }).first();
  if (!exists) {
    await db.movieListLinks.add({ movieId, listId, createdAt: Date.now() });
  }
}

export async function unlinkMovieFromList(movieId: number, listId: number): Promise<void> {
  const links = await db.movieListLinks.where({ movieId, listId }).toArray();
  if (links.length) await db.movieListLinks.bulkDelete(links.map(l => l.id!));
}

export async function isMovieInList(movieId: number, listId: number): Promise<boolean> {
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
  const links = await db.movieListLinks
    .where("listId").equals(listId)
    .reverse()
    .sortBy("createdAt");

  const ids = links.map(l => l.movieId);
  if (!ids.length) return [];

  const items = (await db.movies.bulkGet(ids)).filter(Boolean) as Movie[];
  const order = new Map<number, number>();
  ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}

/* =========================
   Utility
========================= */
export async function clearAll(): Promise<void> {
  await db.transaction(
    "rw",
    db.movies, db.books, db.games, db.lists, db.movieListLinks,
    async () => {
      await Promise.all([
        db.movies.clear(),
        db.books.clear(),
        db.games.clear(),
        db.lists.clear(),
        db.movieListLinks.clear(),
      ]);
    }
  );
}