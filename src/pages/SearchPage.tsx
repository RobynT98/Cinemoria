import { useState } from 'react'

export default function SearchPage() {
  const [q, setQ] = useState('')
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Sök</h1>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Titel, taggar, genrer…"
          className="w-full rounded-2xl bg-ink-800 border border-ink-700 px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button className="btn btn-primary">Sök</button>
      </div>
      <div className="mt-4 text-sand-300 text-sm">Sökresultat visas här när databasen är på plats.</div>
    </section>
  )
}