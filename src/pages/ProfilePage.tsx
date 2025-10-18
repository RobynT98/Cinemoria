import { exportJson, importJson, wipeAll } from '@/db'
import { useRef, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const { theme, setTheme } = useThemeStore()

  async function handleExport() {
    const data = await exportJson()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cinemoria-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const res = await importJson(text)
      setMsg(`Import: filmer +${res.addedMovies}, listor +${res.addedLists}, kopplingar +${res.addedLinks}.`)
    } catch (e: any) {
      setMsg(e?.message || 'Import misslyckades')
    }
  }

  async function handleWipe() {
    if (!confirm('Rensa all din data? (Filmer, listor och kopplingar tas bort. Appen ligger kvar.)')) return
    await wipeAll()
    setMsg('All data rensad.')
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Profil & Inställningar</h1>

      <div className="card p-4 mb-4 space-y-3">
        <h2 className="font-semibold">Tema</h2>
        <p className="text-sand-300 text-sm">Välj mellan mörkt, ljust eller sepia.</p>
        <div className="flex gap-2 flex-wrap">
          <button className={`btn ${theme === 'dark' ? 'btn-primary' : ''}`} onClick={() => setTheme('dark')}>
            Mörkt
          </button>
          <button className={`btn ${theme === 'light' ? 'btn-primary' : ''}`} onClick={() => setTheme('light')}>
            Ljust
          </button>
          <button className={`btn ${theme === 'sepia' ? 'btn-primary' : ''}`} onClick={() => setTheme('sepia')}>
            Sepia
          </button>
        </div>
      </div>

      <div className="card p-4 mb-4 space-y-3">
        <h2 className="font-semibold">Backup</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={handleExport}>Exportera JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Importera JSON</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>
        {msg && <div className="text-sand-300 text-sm">{msg}</div>}
      </div>

      <div className="card p-4 mb-4">
        <h2 className="font-semibold">Datahantering</h2>
        <p className="text-sand-300 text-sm mb-2">Behöver du börja om från noll? Du kan rensa all lokal data.</p>
        <button className="btn" onClick={handleWipe}>Rensa allt</button>
      </div>

      <div className="text-sand-300 text-sm">
        <ul className="list-disc pl-6 space-y-1">
          <li>App: Cinemoria v0.3.0</li>
          <li>Lagring: Offline (IndexedDB). Ingen server krävs.</li>
          <li>Plattform: GitHub Pages.</li>
        </ul>
      </div>
    </section>
  )
}