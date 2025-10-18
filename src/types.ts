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