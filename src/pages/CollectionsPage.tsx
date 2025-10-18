import { useEffect, useState } from 'react'
import { createList, deleteList, getListCounts, getLists, renameList } from '@/db'
import type { List } from '@/types'
import { Plus, Edit3, Trash2 } from 'lucide-react'

export default function CollectionsPage() {
  const [lists, setLists] = useState<List[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)

  async function load() {
    const [ls, cs] = await Promise.all([getLists(), getListCounts()])
    setLists(ls)
    setCounts(cs)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate() {
    const name = prompt('Namn på ny lista (t.ex. "Vampyrfilm", "Favoriter 2025")?')
    if (!name || !name.trim()) return
    setBusy(true)
    await createList(name)
    await load()
    setBusy(false)
  }

  async function handleRename(list: List) {
    const name = prompt('Byt namn på lista:', list.name)
    if (!name || !name.trim() || name === list.name) return
    setBusy(true)
    await renameList(list.id, name)
    await load()
    setBusy(false)
  }

  async function handleDelete(list: List) {
    if (!confirm(`Ta bort listan "${list.name}"? (Filmerna ligger kvar, bara listan försvinner)`)) return
    setBusy(true)
    await deleteList(list.id)
    await load()
    setBusy(false)
  }

  return (
    <section className="p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h1 className="text-2xl font-semibold">Samlingar</h1>
        <button className="btn btn-primary" onClick={handleCreate} disabled={busy}>
          <Plus size={16} className="mr-1" /> Ny lista
        </button>
      </div>

      <p className="text-sand-300 mb-3">
        Skapa listor som <em>Vampyrfilm</em>, <em>Favoriter 2025</em> eller <em>Comfort</em>. Du kan döpa om
        eller ta bort listor när som helst.
      </p>

      <div className="space-y-3">
        {lists.length === 0 && (
          <div className="card p-6">
            Du har inga listor ännu. Tryck <strong>Ny lista</strong> för att skapa din första.
          </div>
        )}

        {lists.map((l) => (
          <article key={l.id} className="card p-4 flex items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-sand-100">{l.name}</h3>
              <p className="text-xs text-sand-400 mt-1">
                {counts[l.id] ?? 0} film{(counts[l.id] ?? 0) === 1 ? '' : 'er'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="chip hover:opacity-90" onClick={() => handleRename(l)} title="Byt namn">
                <Edit3 size={14} /> Byt namn
              </button>
              <button
                className="chip hover:opacity-90"
                onClick={() => handleDelete(l)}
                title="Ta bort lista"
              >
                <Trash2 size={14} /> Ta bort
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}