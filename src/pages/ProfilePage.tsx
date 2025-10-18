import { exportJson, importJson } from '@/db'
import { useRef, useState } from 'react'

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleExport() {
    const data = await exportJson()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cinemoria-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const res = await importJson(text)
      setMsg(`Importerade ${res.added} av ${res.total} poster.`)
    } catch (e: any) {
      setMsg(e?.message || 'Import misslyckades')
    }
  }

  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Profil & Inställningar</h1>
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup</h2>
        <div className="flex gap-2">
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

      <ul className="list-disc pl-6 text-sand-300 space-y-1 mt-6">
        <li>Tema: Mörkt (default). Ljust läge kommer som val.</li>
        <li>Import/Export av databas (JSON) – klart.</li>
        <li>Om appen: Cinemoria v0.2.0</li>
      </ul>
    </section>
  )
}