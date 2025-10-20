// src/db.ts
import Dexie, { type Table } from "dexie";
import type {
  Movie, Book, Game,
  List, MovieListLink,
  BookList, BookListLink,
  GameList, GameListLink,
} from "@/types";

// Re-exporta typer så resten av koden kan `import type {...} from "@/db"`
export type {
  Movie, Book, Game,
  List, MovieListLink,
  BookList, BookListLink,
  GameList, GameListLink,
  // film
  MovieStatus, RegionCode, VideoStandard, Format,
  // bok
  BookFormat,
  // spel
  GamePlatform, GameFormat, GameStatus,
} from "@/types";

class AppDB extends Dexie {
  movies!: Table<Movie, number>;
  books!: Table<Book, number>;
  games!: Table<Game, number>;

  // Movie lists (kallas "lists" i UI)
  lists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  // Book lists
  bookLists!: Table<BookList, number>;
  bookListLinks!: Table<BookListLink, number>;

  // Game lists
  gameLists!: Table<GameList, number>;
  gameListLinks!: Table<GameListLink, number>;

  constructor() {
    super("cinemoria");

    this.version(1).stores({
      movies: "++id, title, createdAt, owned, digital, wishlisted, barcode",
      books:  "++id, title, createdAt, owned, digital, wishlisted, isbn",
      games:  "++id, title, createdAt, owned, digital, wishlisted, barcode",

      // movie
      lists: "++id, name, createdAt",
      movieListLinks: "++id, listId, movieId, createdAt",

      // book
      bookLists: "++id, name, createdAt",
      bookListLinks: "++id, listId, bookId, createdAt",

      // game
      gameLists: "++id, name, createdAt",
      gameListLinks: "++id, listId, gameId, createdAt",
    });

    this.movies = this.table("movies");
    this.books = this.table("books");
    this.games = this.table("games");

    this.lists = this.table("lists");
    this.movieListLinks = this.table("movieListLinks");

    this.bookLists = this.table("bookLists");
    this.bookListLinks = this.table("bookListLinks");

    this.gameLists = this.table("gameLists");
    this.gameListLinks = this.table("gameListLinks");
  }
}

export const db = new AppDB();

/* ============================================================
   MOVIES: CRUD
   ============================================================ */
export async function addMovie(data: Movie) {
  const now = Date.now();
  return db.movies.add({ ...data, createdAt: data.createdAt ?? now, updatedAt: now });
}
export async function getMovie(id: number) { return db.movies.get(id); }
export async function updateMovie(id: number, patch: Partial<Movie>) {
  await db.movies.update(id, { ...patch, updatedAt: Date.now() });
}
export async function deleteMovie(id: number) {
  await db.transaction("rw", db.movieListLinks, db.movies, async () => {
    await db.movieListLinks.where({ movieId: id }).delete();
    await db.movies.delete(id);
  });
}

/* ============================================================
   BOOKS: CRUD
   ============================================================ */
export async function addBook(data: Book) {
  const now = Date.now();
  return db.books.add({ ...data, createdAt: data.createdAt ?? now, updatedAt: now });
}
export async function getBook(id: number) { return db.books.get(id); }
export async function updateBook(id: number, patch: Partial<Book>) {
  await db.books.update(id, { ...patch, updatedAt: Date.now() });
}
export async function deleteBook(id: number) {
  await db.transaction("rw", db.bookListLinks, db.books, async () => {
    await db.bookListLinks.where({ bookId: id }).delete();
    await db.books.delete(id);
  });
}

/* ============================================================
   GAMES: CRUD
   ============================================================ */
export async function addGame(data: Game) {
  const now = Date.now();
  return db.games.add({ ...data, createdAt: data.createdAt ?? now, updatedAt: now });
}
export async function getGame(id: number) { return db.games.get(id); }
export async function updateGame(id: number, patch: Partial<Game>) {
  await db.games.update(id, { ...patch, updatedAt: Date.now() });
}
export async function deleteGame(id: number) {
  await db.transaction("rw", db.gameListLinks, db.games, async () => {
    await db.gameListLinks.where({ gameId: id }).delete();
    await db.games.delete(id);
  });
}

/* ============================================================
   MOVIE LISTS (kallas bara "lists" i UI)
   ============================================================ */
export async function getLists(): Promise<List[]> {
  return db.lists.orderBy("createdAt").reverse().toArray();
}
export async function createList(name: string) {
  const now = Date.now();
  return db.lists.add({ name, createdAt: now, updatedAt: now });
}
export async function renameList(id: number, name: string) {
  await db.lists.update(id, { name, updatedAt: Date.now() });
}
export async function deleteList(id: number) {
  await db.transaction("rw", db.movieListLinks, db.lists, async () => {
    await db.movieListLinks.where({ listId: id }).delete();
    await db.lists.delete(id);
  });
}
export async function getListById(id: number) { return db.lists.get(id); }
export async function linkMovieToList(movieId: number, listId: number) {
  const exists = await db.movieListLinks.where({ movieId, listId }).first();
  if (!exists) await db.movieListLinks.add({ movieId, listId, createdAt: Date.now() });
}
export async function unlinkMovieFromList(movieId: number, listId: number) {
  const links = await db.movieListLinks.where({ movieId, listId }).toArray();
  if (links.length) await db.movieListLinks.bulkDelete(links.map(l => l.id!));
}
export async function isMovieInList(movieId: number, listId: number) {
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
  const links = await db.movieListLinks.where("listId").equals(listId).reverse().sortBy("createdAt");
  const ids = links.map(l => l.movieId);
  if (!ids.length) return [];
  const items = (await db.movies.bulkGet(ids)).filter(Boolean) as Movie[];
  const order = new Map<number, number>(); ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}

/* ============================================================
   BOOK LISTS
   ============================================================ */
export async function getBookLists(): Promise<BookList[]> {
  return db.bookLists.orderBy("createdAt").reverse().toArray();
}
export async function createBookList(name: string) {
  const now = Date.now();
  return db.bookLists.add({ name, createdAt: now, updatedAt: now });
}
export async function renameBookList(id: number, name: string) {
  await db.bookLists.update(id, { name, updatedAt: Date.now() });
}
export async function deleteBookList(id: number) {
  await db.transaction("rw", db.bookListLinks, db.bookLists, async () => {
    await db.bookListLinks.where({ listId: id }).delete();
    await db.bookLists.delete(id);
  });
}
export async function getBookListById(id: number) { return db.bookLists.get(id); }
export async function linkBookToList(bookId: number, listId: number) {
  const exists = await db.bookListLinks.where({ bookId, listId }).first();
  if (!exists) await db.bookListLinks.add({ bookId, listId, createdAt: Date.now() });
}
export async function unlinkBookFromList(bookId: number, listId: number) {
  const links = await db.bookListLinks.where({ bookId, listId }).toArray();
  if (links.length) await db.bookListLinks.bulkDelete(links.map(l => l.id!));
}
export async function isBookInList(bookId: number, listId: number) {
  return !!(await db.bookListLinks.where({ bookId, listId }).first());
}
export async function getBookListCounts(): Promise<Record<string, number>> {
  const all = await db.bookListLinks.toArray();
  return all.reduce<Record<string, number>>((m, l) => {
    const k = String(l.listId);
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}
export async function getBooksInList(listId: number): Promise<Book[]> {
  const links = await db.bookListLinks.where("listId").equals(listId).reverse().sortBy("createdAt");
  const ids = links.map(l => l.bookId);
  if (!ids.length) return [];
  const items = (await db.books.bulkGet(ids)).filter(Boolean) as Book[];
  const order = new Map<number, number>(); ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}
// alias för filer som importerar det längre namnet
export const getBooksInBookList = getBooksInList;

/* ============================================================
   GAME LISTS
   ============================================================ */
export async function getGameLists(): Promise<GameList[]> {
  return db.gameLists.orderBy("createdAt").reverse().toArray();
}
export async function createGameList(name: string) {
  const now = Date.now();
  return db.gameLists.add({ name, createdAt: now, updatedAt: now });
}
export async function renameGameList(id: number, name: string) {
  await db.gameLists.update(id, { name, updatedAt: Date.now() });
}
export async function deleteGameList(id: number) {
  await db.transaction("rw", db.gameListLinks, db.gameLists, async () => {
    await db.gameListLinks.where({ listId: id }).delete();
    await db.gameLists.delete(id);
  });
}
export async function getGameListById(id: number) { return db.gameLists.get(id); }
export async function linkGameToList(gameId: number, listId: number) {
  const exists = await db.gameListLinks.where({ gameId, listId }).first();
  if (!exists) await db.gameListLinks.add({ gameId, listId, createdAt: Date.now() });
}
export async function unlinkGameFromList(gameId: number, listId: number) {
  const links = await db.gameListLinks.where({ gameId, listId }).toArray();
  if (links.length) await db.gameListLinks.bulkDelete(links.map(l => l.id!));
}
export async function isGameInList(gameId: number, listId: number) {
  return !!(await db.gameListLinks.where({ gameId, listId }).first());
}
export async function getGameListCounts(): Promise<Record<string, number>> {
  const all = await db.gameListLinks.toArray();
  return all.reduce<Record<string, number>>((m, l) => {
    const k = String(l.listId);
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}
export async function getGamesInList(listId: number): Promise<Game[]> {
  const links = await db.gameListLinks.where("listId").equals(listId).reverse().sortBy("createdAt");
  const ids = links.map(l => l.gameId);
  if (!ids.length) return [];
  const items = (await db.games.bulkGet(ids)).filter(Boolean) as Game[];
  const order = new Map<number, number>(); ids.forEach((id, i) => order.set(id, i));
  items.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
  return items;
}
// alias för filer som importerar det längre namnet
export const getGamesInGameList = getGamesInList;

/* ============================================================
   BACKUP / IMPORT / WIPE (för ProfilePage)
   ============================================================ */
type ExportShape = {
  version: 1;
  movies: Movie[];
  books: Book[];
  games: Game[];
  lists: List[];
  movieListLinks: MovieListLink[];
  bookLists: BookList[];
  bookListLinks: BookListLink[];
  gameLists: GameList[];
  gameListLinks: GameListLink[];
};

export async function exportJson(): Promise<string> {
  const [movies, books, games, lists, mLinks, bLists, bLinks, gLists, gLinks] =
    await Promise.all([
      db.movies.toArray(),
      db.books.toArray(),
      db.games.toArray(),
      db.lists.toArray(),
      db.movieListLinks.toArray(),
      db.bookLists.toArray(),
      db.bookListLinks.toArray(),
      db.gameLists.toArray(),
      db.gameListLinks.toArray(),
    ]);

  const payload: ExportShape = {
    version: 1,
    movies, books, games,
    lists, movieListLinks: mLinks,
    bookLists: bLists, bookListLinks: bLinks,
    gameLists: gLists, gameListLinks: gLinks,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importJson(json: string) {
  const data = JSON.parse(json) as Partial<ExportShape> | any;

  let addedMovies = 0, addedLists = 0, addedLinks = 0;
  let addedBooks = 0, addedBookLists = 0, addedBookLinks = 0;
  let addedGames = 0, addedGameLists = 0, addedGameLinks = 0;

  await db.transaction(
    "rw",
    db.movies, db.books, db.games,
    db.lists, db.movieListLinks,
    db.bookLists, db.bookListLinks,
    db.gameLists, db.gameListLinks,
    async () => {
      // movies
      for (const m of data.movies ?? []) {
        await db.movies.add(m); addedMovies++;
      }
      for (const l of data.lists ?? []) {
        await db.lists.add(l); addedLists++;
      }
      for (const x of data.movieListLinks ?? []) {
        await db.movieListLinks.add(x); addedLinks++;
      }

      // books
      for (const b of data.books ?? []) {
        await db.books.add(b); addedBooks++;
      }
      for (const l of data.bookLists ?? []) {
        await db.bookLists.add(l); addedBookLists++;
      }
      for (const x of data.bookListLinks ?? []) {
        await db.bookListLinks.add(x); addedBookLinks++;
      }

      // games
      for (const g of data.games ?? []) {
        await db.games.add(g); addedGames++;
      }
      for (const l of data.gameLists ?? []) {
        await db.gameLists.add(l); addedGameLists++;
      }
      for (const x of data.gameListLinks ?? []) {
        await db.gameListLinks.add(x); addedGameLinks++;
      }
    }
  );

  return {
    addedMovies, addedLists, addedLinks,
    addedBooks, addedBookLists, addedBookLinks,
    addedGames, addedGameLists, addedGameLinks,
  };
}

export async function wipeAll() {
  await db.transaction(
    "rw",
    db.movies, db.books, db.games,
    db.lists, db.movieListLinks,
    db.bookLists, db.bookListLinks,
    db.gameLists, db.gameListLinks,
    async () => {
      await Promise.all([
        db.movies.clear(),
        db.books.clear(),
        db.games.clear(),
        db.lists.clear(),
        db.movieListLinks.clear(),
        db.bookLists.clear(),
        db.bookListLinks.clear(),
        db.gameLists.clear(),
        db.gameListLinks.clear(),
      ]);
    }
  );
}

// äldre namn i vissa filer
export const clearAll = wipeAll;