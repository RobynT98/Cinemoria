// src/db.ts
import Dexie, { Table } from "dexie";

export type Format =
  | "uhd"     // 4K UHD
  | "bluray"
  | "dvd"
  | "digital"
  | "vhs"
  | "other";

export interface Movie {
  id?: number;
  title: string;
  year?: number;
  genres?: string[];
  posterUrl?: string;
  seen?: boolean;
  rating?: number;       // 1-10
  trailerUrl?: string;
  createdAt: number;

  // NYTT för samling
  owned?: boolean;       // ägd fysisk/digital
  wishlisted?: boolean;  // på köplistan
  digital?: boolean;     // är den digital (köpt/ägd digitalt)
  format?: Format;       // fysisk/digital typ
  location?: string;     // hylla/låda/app-konto etc
  provider?: string;     // t.ex. iTunes, Google, Plex...
}

export interface List {
  id?: number;
  name: string;
  createdAt: number;
}

export interface MovieListLink {
  id?: number;
  movieId: number;
  listId: number;
}

class CinemoriaDB extends Dexie {
  movies!: Table<Movie, number>;
  lists!: Table<List, number>;
  movieList!: Table<MovieListLink, number>;

  constructor() {
    super("cinemoria");

    // v1 – (historisk) enkel index
    this.version(1).stores({
      movies: "++id, title, year, createdAt",
      lists: "++id, name, createdAt",
      movieList: "++id, movieId, listId",
    });

    // v2 – samlarfält och hjälpsamma index
    this.version(2)
      .stores({
        movies:
          "++id, title, year, createdAt, owned, wishlisted, digital, format",
        lists: "++id, name, createdAt",
        movieList: "++id, movieId, listId",
      })
      .upgrade(async (tx) => {
        // Sätt rimliga defaults utan att förstöra gammal data
        const all = await tx.table<Movie>("movies").toArray();
        for (const m of all) {
          if (m.owned === undefined) m.owned = false;
          if (m.wishlisted === undefined) m.wishlisted = false;
          if (m.digital === undefined) m.digital = false;
          if (!m.format) m.format = m.digital ? "digital" : "other";
          await tx.table<Movie>("movies").put(m);
        }
      });
  }
}

export const db = new CinemoriaDB();

// Exporter som redan används i appen
export async function exportJson(): Promise<string> {
  const [movies, lists, links] = await Promise.all([
    db.movies.toArray(),
    db.lists.toArray(),
    db.movieList.toArray(),
  ]);
  return JSON.stringify({ movies, lists, links }, null, 2);
}

export async function importJson(json: string) {
  const { movies = [], lists = [], links = [] } = JSON.parse(json || "{}");
  let addedMovies = 0, addedLists = 0, addedLinks = 0;

  await db.transaction("rw", db.movies, db.lists, db.movieList, async () => {
    for (const m of movies) {
      const copy = { ...m };
      delete (copy as any).id;
      await db.movies.add(copy); addedMovies++;
    }
    for (const l of lists) {
      const copy = { ...l }; delete (copy as any).id;
      await db.lists.add(copy); addedLists++;
    }
    for (const x of links) {
      const copy = { ...x }; delete (copy as any).id;
      await db.movieList.add(copy); addedLinks++;
    }
  });

  return { addedMovies, addedLists, addedLinks };
}

export async function wipeAll() {
  await db.transaction("rw", db.movies, db.lists, db.movieList, async () => {
    await db.movies.clear();
    await db.lists.clear();
    await db.movieList.clear();
  });
}