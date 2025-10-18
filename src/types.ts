export type MovieStatus = 'planned' | 'watching' | 'watched'

export interface Movie {
  id: string
  title: string
  year?: number
  posterUrl?: string
  genres: string[]
  tags: string[]
  status: MovieStatus
  rating?: number // 0–10
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface List {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ListItem {
  // primärnyckel kombinerad: `${listId}::${movieId}`
  id: string
  listId: string
  movieId: string
  createdAt: number
}