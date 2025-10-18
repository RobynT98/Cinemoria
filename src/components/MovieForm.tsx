import { useState } from 'react'
import type { Movie, MovieStatus } from '../types'

type Draft = {
  title: string
  year?: number
  posterUrl?: string
  genres: string
  tags: string
  status: MovieStatus
  rating?: number
  notes?: string
}

export default function MovieForm({ onSubmit }: { onSubmit: (movie: Omit<Movie,'id'|'createdAt'|'updatedAt'>) => Promise<void> | void }) {
  const [draft, setDraft] = useState<Draft>({
    title: '',
    genres: '',
    tags: '',
    status: 'planned'
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft((d) => ({ ...d, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!draft.title.trim()) return setErr('Titel krävs')

    const payload: Omit<Movie,'id'|'createdAt'|'updatedAt'> = {
      title: draft.title.trim(),
      year: draft.year || undefined,
      posterUrl: draft.posterUrl?.trim() || undefined,
      genres: draft.genres ? draft.genres.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: draft.tags ? draft.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: draft.status,
      rating: typeof draft.rating === 'number' ? draft.rating : undefined,
      notes: draft.notes?.trim() || undefined,
    }

    try {
      setBusy(true)
      await onSubmit(payload)
      // reset
      setDraft({ title: '', genres: '', tags: '', status: 'planned' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <Input label="Titel" required value={draft.title} onChange={(v) => set('title', v)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="År" type="number" min="1888" max="2100" value={draft.year as any} onChange={(v) => set('year', v ? Number(v) : undefined)} />
        <Input label="Betyg (0–10)" type="number" step="0.1" min="0" max="10" value={draft.rating as any} onChange={(v) => set('rating', v === '' ? undefined : Number(v))} />
      </div>
      <Input label="Poster-URL" value={draft.posterUrl || ''} onChange={(v) => set('posterUrl', v)} />
      <Input label="Genrer (komma-separerat)" value={draft.genres} onChange={(v) => set('genres', v)} />
      <Input label="Taggar (komma-separerat)" value={draft.tags} onChange={(v) => set('tags', v)} />
      <div>
        <label className="block text-sm text-sand-300 mb-1">Status</label>
        <select
          className="w-full rounded-2xl bg-ink-800 border border-ink-700 px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500"
          value={draft.status}
          onChange={(e) => set('status', e.target.value as MovieStatus)}
        >
          <option value="planned">Att se</option>
          <option value="watching">Pågående</option>
          <option value="watched">Sett</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-sand-300 mb-1">Anteckning</label>
        <textarea
          rows={3}
          className="w-full rounded-2xl bg-ink-800 border border-ink-700 px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500"
          value={draft.notes || ''}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Valfritt…"
        />
      </div>
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sparar…' : 'Spara film'}</button>
    </form>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  label: string
  value: any
  onChange: (v: string) => void
  type?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm text-sand-300 mb-1">{label}</label>
      <input
        {...rest}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-ink-800 border border-ink-700 px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
  )
}