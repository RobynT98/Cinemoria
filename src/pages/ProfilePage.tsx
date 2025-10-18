export default function ProfilePage() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Profil & Inställningar</h1>
      <ul className="list-disc pl-6 text-sand-300 space-y-1">
        <li>Tema: Mörkt (default). Ljust läge kommer som val.</li>
        <li>Import/Export av databas (JSON) – läggs till snart.</li>
        <li>Om appen: Cinemoria v0.1.0</li>
      </ul>
    </section>
  )
}