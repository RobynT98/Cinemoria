import Dexie, { Table } from 'dexie'
import type { Movie, List, ListItem } from './types'

class CinemoriaDB extends Dexie {
  movies!: Table<Movie, string>
  lists!: Table<List, string>
  listItems!: Table<ListItem, string>

  constructor() {
    super('cinemoria')

    // v1: bara movies
    this.version(1).stores({
      movies: 'id, title, year, status, createdAt'
    })

    // v2: listor + listItems
    this.version(2).stores({
      movies: 'id, title, year, status, createdAt',
      lists: 'id, name, createdAt',
      listItems: 'id, listId, movieId, createdAt'
    })
  }
}

export const db = new CinemoriaDB()

/* ---------- Movies ---------- */
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
  // ta bort relationslänkar också
  const links = await db.listItems.where('movieId').equals(id).toArray()
  if (links.length) {
    await db.listItems.bulkDelete(links.map((l) => l.id))
  }
  await db.movies.delete(id)
}

export async function getAllMovies() {
  return db.movies.orderBy('createdAt').reverse().toArray()
}

/* ---------- Backup ---------- */
export async function exportJson() {
  const [movies, lists, listItems] = await Promise.all([
    db.movies.toArray(),
    db.lists.toArray(),
    db.listItems.toArray()
  ])
  return JSON.stringify(
    { version: 2, exportedAt: new Date().toISOString(), movies, lists, listItems },
    null,
    2
  )
}

export async function importJson(text: string) {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') throw new Error('Ogiltig backupfil')
  const movies: Movie[] = parsed.movies || []
  const lists: List[] = parsed.lists || []
  const listItems: ListItem[] = parsed.listItems || []

  // enkel merge (skippar dubbletter)
  const exMovie = new Set((await db.movies.toCollection().primaryKeys()) as string[])
  const exList = new Set((await db.lists.toCollection().primaryKeys()) as string[])
  const exLink = new Set((await db.listItems.toCollection().primaryKeys()) as string[])

  const mAdd = movies.filter((m) => m?.id && !exMovie.has(m.id))
  const lAdd = lists.filter((l) => l?.id && !exList.has(l.id))
  const liAdd = listItems.filter((li) => li?.id && !exLink.has(li.id))

  await db.transaction('rw', db.movies, db.lists, db.listItems, async () => {
    if (mAdd.length) await db.movies.bulkAdd(mAdd)
    if (lAdd.length) await db.lists.bulkAdd(lAdd)
    if (liAdd.length) await db.listItems.bulkAdd(liAdd)
  })

  return { addedMovies: mAdd.length, addedLists: lAdd.length, addedLinks: liAdd.length }
}

/* ---------- Lists ---------- */
export async function createList(name: string) {
  const id = crypto.randomUUID ? crypto.randomUUID() : `L-${Date.now()}-${Math.random()}`
  const now = Date.now()
  const list: List = { id, name: name.trim(), createdAt: now, updatedAt: now }
  await db.lists.add(list)
  return list
}

export async function renameList(id: string, name: string) {
  const now = Date.now()
  await db.lists.update(id, { name: name.trim(), updatedAt: now })
}

export async function deleteList(id: string) {
  const links = await db.listItems.where('listId').equals(id).toArray()
  await db.transaction('rw', db.listItems, db.lists, async () => {
    if (links.length) await db.listItems.bulkDelete(links.map((l) => l.id))
    await db.lists.delete(id)
  })
}

export async function getLists() {
  return db.lists.orderBy('createdAt').toArray()
}

export async function getListCounts(): Promise<Record<string, number>> {
  const lists = await getLists()
  const entries = await Promise.all(
    lists.map(async (l) => [l.id, await db.listItems.where('listId').equals(l.id).count()] as const)
  )
  return Object.fromEntries(entries)
}

/* ---------- Maintenance ---------- */
export async function wipeAll() {
  await db.transaction('rw', db.movies, db.lists, db.listItems, async () => {
    await db.listItems.clear()
    await db.lists.clear()
    await db.movies.clear()
  })
}