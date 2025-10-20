// src/db.ts
import Dexie, { Table } from "dexie";
import {
  Movie,
  List,
  MovieListLink,
  Book,
  BookList,
  BookListLink,
  Game,
  GameList,
  GameListLink,
} from "./types";

export class CinemoriaDB extends Dexie {
  movies!: Table<Movie, number>;
  movieLists!: Table<List, number>;
  movieListLinks!: Table<MovieListLink, number>;

  books!: Table<Book, number>;
  bookLists!: Table<BookList, number>;
  bookListLinks!: Table<BookListLink, number>;

  games!: Table<Game, number>;
  gameLists!: Table<GameList, number>;
  gameListLinks!: Table<GameListLink, number>;

  constructor() {
    super("CinemoriaDB");

    this.version(1).stores({
      movies:
        "++id, title, year, owned, wishlisted, format, createdAt, barcode",
      movieLists: "++id, name, createdAt",
      movieListLinks: "++id, movieId, listId",

      books: "++id, title, author, year, owned, wishlisted, format, createdAt",
      bookLists: "++id, name, createdAt",
      bookListLinks: "++id, bookId, listId",

      games: "++id, title, year, platform, owned, wishlisted, createdAt",
      gameLists: "++id, name, createdAt",
      gameListLinks: "++id, gameId, listId",
    });
  }
}

export const db = new CinemoriaDB();