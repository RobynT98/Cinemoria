// src/db.ts
import Dexie, { type Table } from "dexie";
import type {
  Movie,
  Book,
  Game,
  List,
  MovieListLink,
} from "@/types";

// 🔁 Re-exportera typer (Alternativ B)
export type {
  Movie,
  Book,
  Game,
  List,
  MovieListLink,
  // Film
  MovieStatus,
  RegionCode,
  VideoStandard,
  Format,
  // Bok
  BookFormat,
  // Spel
  GamePlatform,
  GameFormat,
  GameStatus,
} from "@/types";

/* ============================================
   Dexie-definition
============================================= */
class AppDB extends Dexie {
  // Tabeller
  movies!: Table<Movie, number>;
  books!: Table<Book, number>;
  games!: Table<Game, number>;

  lists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  constructor() {
    super("cinemoria");

    // Version 1 – grundschema
    this.version(1).stores({
      movies:
        "++id, title, createdAt, owned, digital, wishlisted, barcode",
      books:
        "++id, title, createdAt, owned, digital, wishlisted, isbn",
      games:
        "++id, title, createdAt, owned, digital, wishlisted, barcode",

      // Listor för film
      lists: "++id, name, createdAt",
      movieListLinks: "++id, listId, movieId, createdAt",
    });

    // Mappa till tabellerna
    this.movies = this.table("movies");
    this.books = this.table("books");
    this.games = this.table("games");
    this.lists = this.table("lists");
    this.movieListLinks = this.table("movieListLinks");
  }
}

export const db = new AppDB();

/* ============================================
   Hjälpare – LISTOR (Film)
============================================= */
export async function getLists(): Promise<List[]> {
  return db.lists.orderBy("createdAt").reverse().toArray();
}

export async function createList(name: string): Promise<number> {
  const now = Date.now();
  return db.lists.add({ name, createdAt: now, updatedAt: now });
}

export async function renameList(id: number, name: string): Promise<void> {
  const now = Date.now();
  await db.lists.update(id, { name, updatedAt: now });
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
  const exists = await db.movieListLinks
    .where({ movieId, listId })
    .first();
  if (!exists) {
    await db.movieListLinks.add({
      movieId,
      listId,
      createdAt: Date.now(),
    });
  }
}

export async function unlinkMovieFromList(movieId: number, listId: number): Promise<void> {
  const links = await db.movieListLinks.where({ movieId, listId }).toArray();
  if (links.length) {
    await db.movieListLinks.bulkDelete(links.map(l => l.id!));
  }
}

export async function isMovieInList(movieId: number, listId: number): Promise<boolean> {
  const row = await db.movieListLinks.where({ movieId, listId }).first();
  return !!row;
}

/** Antal filmer per lista: { [listId]: count } */
export async function getListCounts(): Promise<Record<string, number>> {
  const all = await db.movieListLinks.toArray();
  return all.reduce<Record<string, number>>((acc, link) => {
    const key = String(link.listId);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

/** Hämta alla filmer i en viss lista (senast länkad först). */
export async function getMoviesInList(listId: number): Promise<Movie[]> {
  const links = await db.movieListLinks
    .where("listId")
    .equals(listId)
    .reverse()
    .sortBy("createdAt"); // senast länkade först

  const ids = links.map(l => l.movieId);
  if (!ids.length) return [];

  const movies = await db.movies.bulkGet(ids);
  // Dexie kan returnera undefined om nån id saknas – filtrera bort
  const filtered = movies.filter(Boolean) as Movie[];

  // Behåll samma ordning som länkarna
  const order = new Map<number, number>();
  ids.forEach((id, i) => order.set(id, i));
  filtered.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));

  return filtered;
}

/* ============================================
   Hjälpare – SPEL (små CRUD)
============================================= */
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
  await db.games.update(id, {
    ...patch,
    updatedAt: Date.now(),
  });
}

/* ============================================
   Små verktyg (valfria)
============================================= */
export async function clearAll(): Promise<void> {
  await db.transaction(
    "rw",
    db.movies,
    db.books,
    db.games,
    db.lists,
    db.movieListLinks,
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