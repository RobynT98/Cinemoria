import Dexie, { Table } from 'dexie'
import type { Movie } from './types'

class CinemoriaDB extends Dexie {
  movies!: Table<Movie, string>

  constructor() {
    super('cinemoria')
    this.version(1).stores({
      movies: 'id, title, year, status, createdAt' // indexer
    })
  }
}

export const db = new CinemoriaDB()

export async function addMovie(data: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  const now = Date.now()
  const movie: Movie = { id, createdAt: now, updatedAt: now, ...data }
  await db.movies.add(movie)
  return movie
}

export async function updateMovie(id: string, patch: Partial<Movie>) {
  const now = Date.now()
  await db.movies.update(id, { ...patch, updatedAt: now })
}

export async function deleteMovie(id: string) {
  await db.movies.delete(id)
}

export async function getAllMovies() {
  return db.movies.orderBy('createdAt').reverse().toArray()
}

export async function exportJson() {
  const movies = await getAllMovies()
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), movies }, null, 2)
}

export async function importJson(text: string) {
  const parsed = JSON.parse(text)
  if (!parsed?.movies || !Array.isArray(parsed.movies)) throw new Error('Ogiltig backupfil')
  // enkel merge: skippar duplicerade idn
  const existing = new Set((await db.movies.toCollection().primaryKeys()) as string[])
  const toAdd = parsed.movies.filter((m: any) => m && typeof m.id === 'string' && !existing.has(m.id))
  if (toAdd.length) await db.movies.bulkAdd(toAdd)
  return { added: toAdd.length, total: parsed.movies.length }
}